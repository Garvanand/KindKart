'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AppShell } from '@/components/layout';
import { PremiumCard, PageHeader } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Send, Paperclip, CheckCheck, Users, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { demoConversations, demoMessagesByRequest } from '@/lib/demo-data';

interface Conversation {
  requestId: string;
  requestTitle: string;
  otherUser: { id: string; name: string; profilePhoto?: string };
  lastMessage: { content: string; senderName: string; createdAt: string } | null;
  updatedAt: string;
}

interface LocalMessage {
  id: string;
  content: string;
  sender: 'me' | 'other';
  time: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messagesByRequest, setMessagesByRequest] = useState<Record<string, LocalMessage[]>>({});

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }
    void loadConversations();
  }, [isAuthenticated, router, user]);

  const loadConversations = async () => {
    try {
      setError(null);
      setIsLoading(true);

      if (isGuest) {
        setConversations(demoConversations as Conversation[]);
        setMessagesByRequest(demoMessagesByRequest);
        setSelectedChat((current) => current ?? demoConversations[0]?.requestId ?? null);
        return;
      }

      const data = await api.messages.getConversations();
      const safeConversations = Array.isArray(data) ? (data as Conversation[]) : [];
      setConversations(safeConversations);
      setSelectedChat((current) => current ?? safeConversations[0]?.requestId ?? null);
    } catch (loadError: any) {
      setError(loadError?.message || 'Unable to load conversations');
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const target = `${conv.otherUser.name} ${conv.requestTitle} ${conv.lastMessage?.content || ''}`.toLowerCase();
      return target.includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  const selectedConversation = filteredConversations.find((c) => c.requestId === selectedChat)
    || conversations.find((c) => c.requestId === selectedChat)
    || null;

  const activeMessages = selectedConversation ? messagesByRequest[selectedConversation.requestId] ?? [] : [];

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (ts: string) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 3600000;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleSend = async () => {
    if (!selectedConversation || !newMessage.trim() || isSending) return;

    const content = newMessage.trim();
    const requestId = selectedConversation.requestId;
    const optimistic: LocalMessage = {
      id: `local-${Date.now()}`,
      content,
      sender: 'me',
      time: new Date().toISOString(),
    };

    setMessagesByRequest((prev) => ({
      ...prev,
      [requestId]: [...(prev[requestId] || []), optimistic],
    }));
    setNewMessage('');

    if (isGuest) {
      setTimeout(() => {
        setMessagesByRequest((prev) => ({
          ...prev,
          [requestId]: [
            ...(prev[requestId] || []),
            {
              id: `demo-reply-${Date.now()}`,
              content: 'Looks good. I am on my way, see you shortly.',
              sender: 'other',
              time: new Date().toISOString(),
            },
          ],
        }));
      }, 900);
      return;
    }

    try {
      setIsSending(true);
      await api.messages.send(requestId, content, selectedConversation.otherUser.id);
    } catch {
      setError('Message could not be sent. Please retry.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isAuthenticated || !user) return null;

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Messages"
          description={`${conversations.length} conversations`}
          icon={<MessageCircle className="h-6 w-6" />}
          actions={
            <Button variant="outline" size="sm" className="gap-2" onClick={loadConversations}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
          }
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {error && (
            <PremiumCard className="mb-4 border-rose-300/50 bg-rose-500/5 p-3">
              <p className="text-sm text-rose-300">{error}</p>
            </PremiumCard>
          )}

          <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-230px)]">
            <PremiumCard className="p-0 overflow-hidden flex flex-col">
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="input-premium w-full pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto scrollbar-thin">
                {isLoading ? (
                  <div className="p-3 space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-3 w-3/4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                    <Users className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h3 className="font-semibold mb-1">No conversations yet</h3>
                    <p className="text-sm text-muted-foreground">Start helping neighbors to begin chatting.</p>
                  </div>
                ) : (
                  filteredConversations.map((conv, index) => (
                    <motion.button
                      key={conv.requestId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => setSelectedChat(conv.requestId)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/20',
                        selectedChat === conv.requestId && 'bg-primary/5 border-l-2 border-l-primary'
                      )}
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {getInitials(conv.otherUser.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{conv.otherUser.name}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(conv.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.requestTitle}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{conv.lastMessage.content}</p>
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </PremiumCard>

            <PremiumCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex items-center justify-between p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                        {getInitials(selectedConversation.otherUser.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{selectedConversation.otherUser.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedConversation.requestTitle}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-4 space-y-3 scrollbar-thin">
                    {activeMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                        Start the conversation about this request.
                      </div>
                    ) : (
                      activeMessages.map((message) => (
                        <div key={message.id} className={cn('flex', message.sender === 'me' ? 'justify-end' : 'justify-start')}>
                          <div className={cn(
                            'max-w-xs rounded-2xl px-3 py-2',
                            message.sender === 'me'
                              ? 'bg-primary text-primary-foreground rounded-tr-md'
                              : 'bg-muted/30 text-foreground rounded-tl-md'
                          )}>
                            <p className="text-sm">{message.content}</p>
                            <div className="mt-1 flex items-center gap-1 justify-end text-[10px] opacity-70">
                              <span>{formatTime(message.time)}</span>
                              {message.sender === 'me' && <CheckCheck className="h-3 w-3" />}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault();
                            void handleSend();
                          }
                        }}
                        className="input-premium flex-1 py-2 text-sm"
                      />
                      <Button size="sm" className="h-9 w-9 p-0 flex-shrink-0" disabled={!newMessage.trim() || isSending} onClick={() => void handleSend()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/10 mb-4" />
                  <h3 className="font-semibold mb-1">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">Choose a chat from the left panel.</p>
                </div>
              )}
            </PremiumCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
