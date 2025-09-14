'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { api } from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
}

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  requester: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  helper?: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, accessToken } = useAuthStore();
  const { connect, disconnect, socketManager } = useSocket();
  
  const [request, setRequest] = useState<HelpRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [otherUser, setOtherUser] = useState<{ id: string; name: string; profilePhoto?: string } | null>(null);

  const communityId = params.id as string;
  const requestId = params.requestId as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    loadRequest();
    loadMessages();

    // Connect to socket
    if (accessToken) {
      const socket = connect();
      if (socket) {
        setupSocketListeners(socket);
      }
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, requestId, accessToken]);

  const loadRequest = async () => {
    try {
      const requestData = await api.requests.get(requestId);
      setRequest(requestData);
      
      // Determine the other user (if current user is requester, other user is helper and vice versa)
      if (requestData.requester.id === user?.id) {
        if (requestData.helper) {
          setOtherUser(requestData.helper);
        }
      } else {
        setOtherUser(requestData.requester);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request');
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await api.messages.getByRequest(requestId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = (socket: any) => {
    // Join the chat room
    socketManager.joinChat(requestId);

    // Listen for new messages
    socketManager.onNewMessage((message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for typing indicators
    socketManager.onTyping((data: { userId: string; isTyping: boolean }) => {
      // Handle typing indicators if needed
      console.log('Typing:', data);
    });
  };

  const handleSendMessage = async (content: string) => {
    if (!otherUser || !user) return;

    setIsSending(true);
    try {
      // Send message via socket
      socketManager.sendMessage(requestId, content, otherUser.id);

      // Also send to API for persistence
      await api.messages.send(requestId, content, otherUser.id);

      // Optimistically add message to local state
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: otherUser.id,
        content,
        messageType: 'text',
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          name: user.name,
          profilePhoto: undefined // Add profile photo if available
        }
      };

      setMessages(prev => [...prev, tempMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={() => router.push(`/communities/${communityId}`)} className="w-full">
                Back to Community
              </Button>
              <Button variant="outline" onClick={loadRequest} className="w-full">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request || !otherUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Chat Not Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This chat is not available. Make sure the request has been accepted and you have permission to chat.
            </p>
            <Button onClick={() => router.push(`/communities/${communityId}`)} className="w-full">
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user has permission to chat (requester or assigned helper)
  const canChat = request.requester.id === user.id || 
                  (request.helper && request.helper.id === user.id);

  if (!canChat) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this chat. Only the requester and assigned helper can chat.
            </p>
            <Button onClick={() => router.push(`/communities/${communityId}`)} className="w-full">
              Back to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/communities/${communityId}/requests/${requestId}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Request
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Chat</h1>
                <p className="text-sm text-gray-500">{request.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ChatInterface
          requestId={requestId}
          otherUser={otherUser}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isSending}
        />
      </main>
    </div>
  );
}
