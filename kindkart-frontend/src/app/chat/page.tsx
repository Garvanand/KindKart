'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { AppShell } from '@/components/layout';
import { PremiumCard, Badge, PageHeader } from '@/components/ui-kit';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Send, Paperclip, Phone, Video, MoreVertical, CheckCheck, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
  requestId: string;
  requestTitle: string;
  otherUser: { id: string; name: string; profilePhoto?: string };
  lastMessage: { content: string; senderName: string; createdAt: string } | null;
  updatedAt: string;
}

const mockConversations: Conversation[] = [
  { requestId: '1', requestTitle: 'Plumbing Fix', otherUser: { id: '1', name: 'Raj Patel' }, lastMessage: { content: 'I can come by at 3 PM today', senderName: 'Raj Patel', createdAt: new Date(Date.now() - 300000).toISOString() }, updatedAt: new Date(Date.now() - 300000).toISOString() },
  { requestId: '2', requestTitle: 'WiFi Setup Help', otherUser: { id: '2', name: 'Priya Singh' }, lastMessage: { content: 'Thanks for the help! Payment sent.', senderName: 'You', createdAt: new Date(Date.now() - 3600000).toISOString() }, updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { requestId: '3', requestTitle: 'Piano Lessons', otherUser: { id: '3', name: 'Anjali Verma' }, lastMessage: { content: 'My kid loved the first session!', senderName: 'Anjali Verma', createdAt: new Date(Date.now() - 7200000).toISOString() }, updatedAt: new Date(Date.now() - 7200000).toISOString() },
];

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user) { router.push('/auth'); return; }
    loadConversations();
  }, [isAuthenticated, user, router]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await api.messages.getConversations();
      setConversations(Array.isArray(data) && data.length > 0 ? data : mockConversations);
    } catch {
      setConversations(mockConversations);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const formatTime = (ts: string) => {
    const diff = (Date.now() - new Date(ts).getTime()) / 3600000;
    if (diff < 1) return 'Just now';
    if (diff < 24) return `${Math.floor(diff)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (!isAuthenticated || !user) return null;

  const selectedConversation = conversations.find(c => c.requestId === selectedChat);

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Messages"
          description={`${conversations.length} conversations`}
          icon={<MessageCircle className="h-6 w-6" />}
        />

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-4 lg:grid-cols-3 h-[calc(100vh-220px)]">
            {/* Conversation List */}
            <PremiumCard className="p-0 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-border/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input-premium w-full pl-9 py-2 text-sm"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-auto scrollbar-thin">
                {isLoading ? (
                  <div className="p-3 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3 p-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-3 w-3/4" /></div></div>
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/20 mb-4" />
                    <h3 className="font-semibold mb-1">No conversations yet</h3>
                    <p className="text-sm text-muted-foreground">Start helping neighbors to begin chatting.</p>
                  </div>
                ) : (
                  conversations.map((conv, i) => (
                    <motion.button
                      key={conv.requestId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => setSelectedChat(conv.requestId)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/20',
                        selectedChat === conv.requestId && 'bg-primary/5 border-l-2 border-l-primary'
                      )}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                          {getInitials(conv.otherUser.name)}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-card" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{conv.otherUser.name}</p>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">{formatTime(conv.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{conv.requestTitle}</p>
                        {conv.lastMessage && (
                          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </PremiumCard>

            {/* Chat Area */}
            <PremiumCard className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between p-4 border-b border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">
                        {getInitials(selectedConversation.otherUser.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{selectedConversation.otherUser.name}</p>
                        <p className="text-xs text-emerald-400">Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Phone className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Video className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  {/* Messages area */}
                  <div className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin">
                    {/* Mock messages */}
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{getInitials(selectedConversation.otherUser.name)}</div>
                      <div>
                        <div className="p-3 rounded-2xl rounded-tl-md bg-muted/30 max-w-xs">
                          <p className="text-sm">Hi! I saw your request. I can help with that.</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">2:30 PM</p>
                      </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                      <div>
                        <div className="p-3 rounded-2xl rounded-tr-md bg-primary text-primary-foreground max-w-xs">
                          <p className="text-sm">That would be great! When are you available?</p>
                        </div>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <p className="text-[10px] text-muted-foreground">2:32 PM</p>
                          <CheckCheck className="h-3 w-3 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{getInitials(selectedConversation.otherUser.name)}</div>
                      <div>
                        <div className="p-3 rounded-2xl rounded-tl-md bg-muted/30 max-w-xs">
                          <p className="text-sm">{selectedConversation.lastMessage?.content || 'I can come by at 3 PM today'}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">2:35 PM</p>
                      </div>
                    </div>
                    {/* Typing indicator */}
                    <div className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{getInitials(selectedConversation.otherUser.name)}</div>
                      <div className="p-3 rounded-2xl rounded-tl-md bg-muted/30">
                        <div className="flex gap-1">
                          <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0 }} />
                          <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} />
                          <motion.span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input area */}
                  <div className="p-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 flex-shrink-0"><Paperclip className="h-4 w-4" /></Button>
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="input-premium flex-1 py-2 text-sm"
                        onKeyDown={e => { if (e.key === 'Enter' && newMessage.trim()) setNewMessage(''); }}
                      />
                      <Button size="sm" className="h-9 w-9 p-0 flex-shrink-0" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                  <MessageCircle className="h-16 w-16 text-muted-foreground/10 mb-4" />
                  <h3 className="font-semibold mb-1">Select a conversation</h3>
                  <p className="text-sm text-muted-foreground">Choose a chat from the sidebar to start messaging</p>
                </div>
              )}
            </PremiumCard>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
