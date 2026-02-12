'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AppShell, PageContainer } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Conversation {
  requestId: string;
  requestTitle: string;
  otherUser: {
    id: string;
    name: string;
    profilePhoto?: string;
  };
  lastMessage: {
    content: string;
    senderName: string;
    createdAt: string;
  } | null;
  updatedAt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/auth');
      return;
    }

    loadConversations();
  }, [isAuthenticated, user, router]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversationsData = await api.messages.getConversations();
      setConversations(Array.isArray(conversationsData) ? conversationsData : []);
    } catch (error) {
      console.warn('Conversations unavailable (backend may be off):', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <AppShell>
      <PageContainer className="py-6 lg:py-8" maxWidth="md">
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Messages</h1>
          <p className="text-sm text-muted-foreground">Your conversations</p>
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">No conversations yet</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                When you start helping others or receive help, your conversations will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card
                key={conversation.requestId}
                className="cursor-pointer transition-colors hover:border-primary/30 hover:bg-muted/30"
                onClick={() => router.push(`/chat/${conversation.requestId}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={conversation.otherUser.profilePhoto} />
                      <AvatarFallback>{getInitials(conversation.otherUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-medium text-foreground">
                          {conversation.otherUser.name}
                        </h3>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatLastSeen(conversation.updatedAt)}
                        </span>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {conversation.requestTitle}
                      </p>
                      {conversation.lastMessage ? (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {conversation.lastMessage.senderName === user.name ? 'You' : conversation.lastMessage.senderName}:
                          </span>{' '}
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-sm text-muted-foreground">No messages yet</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
