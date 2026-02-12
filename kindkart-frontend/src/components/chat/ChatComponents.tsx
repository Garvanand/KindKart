'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Smile, MessageCircle, CheckCheck, Clock } from 'lucide-react';
import { PremiumCard } from '@/components/ui-kit/cards';
import { cn } from '@/lib/utils';

/**
 * ChatMessage - Individual message component with status indicators
 */
export interface ChatMessageProps {
  id: string;
  content: string;
  author: string;
  avatar?: string;
  timestamp: string;
  isOwn?: boolean;
  status?: 'sending' | 'sent' | 'read';
  isTyping?: boolean;
  reactions?: Array<{ emoji: string; count: number }>;
}

export function ChatMessage({
  id,
  content,
  author,
  avatar,
  timestamp,
  isOwn = false,
  status = 'read',
  isTyping = false,
  reactions,
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-3 mb-4', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar */}
      {!isOwn && avatar && (
        <img src={avatar} alt={author} className="h-8 w-8 rounded-full flex-shrink-0" />
      )}

      {/* Message content */}
      <div className={cn('flex flex-col gap-1 max-w-xs', isOwn && 'items-end')}>
        {/* Author and timestamp */}
        {!isOwn && (
          <p className="text-xs font-semibold text-muted-foreground mb-1">{author}</p>
        )}

        {/* Message bubble */}
        <motion.div
          className={cn(
            'px-4 py-2.5 rounded-xl break-words',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
          whileHover={{ scale: 1.01 }}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="h-2 w-2 rounded-full bg-current"
              />
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                className="h-2 w-2 rounded-full bg-current"
              />
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="h-2 w-2 rounded-full bg-current"
              />
            </div>
          ) : (
            <p className="text-sm">{content}</p>
          )}
        </motion.div>

        {/* Reactions */}
        {reactions && reactions.length > 0 && (
          <div className="flex gap-1 mt-1">
            {reactions.map((reaction, idx) => (
              <motion.button
                key={idx}
                className="px-2 py-0.5 text-xs rounded-full bg-muted border border-border hover:bg-muted/70 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {reaction.emoji} {reaction.count}
              </motion.button>
            ))}
          </div>
        )}

        {/* Timestamp and status */}
        {isOwn && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{timestamp}</span>
            {status === 'sending' && <Clock className="h-3 w-3" />}
            {status === 'sent' && <CheckCheck className="h-3 w-3" />}
            {status === 'read' && (
              <motion.div animate={{ color: ['hsl(var(--muted-foreground))', 'hsl(var(--primary))'] }}>
                <CheckCheck className="h-3 w-3 text-primary" />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * ChatInput - Enhanced chat input with rich features
 */
export interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onAttach?: () => void;
  onEmoji?: () => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onAttach,
  onEmoji,
  disabled = false,
  placeholder = "Type a message...",
  isLoading = false,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3 p-4 rounded-xl bg-muted/50 border border-border/50"
    >
      {/* Attachment button */}
      {onAttach && (
        <motion.button
          onClick={onAttach}
          className="h-10 w-10 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        >
          <Paperclip className="h-5 w-5" />
        </motion.button>
      )}

      {/* Text input */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 resize-none rounded-lg bg-background border border-border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all max-h-24 scrollbar-thin"
        rows={1}
        style={{ minHeight: '40px' }}
      />

      {/* Emoji button */}
      {onEmoji && (
        <motion.button
          onClick={onEmoji}
          className="h-10 w-10 rounded-lg hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          disabled={disabled}
        >
          <Smile className="h-5 w-5" />
        </motion.button>
      )}

      {/* Send button */}
      <motion.button
        onClick={onSend}
        disabled={disabled || !value.trim() || isLoading}
        className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center transition-all',
          value.trim() && !disabled
            ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
        whileHover={value.trim() && !disabled ? { scale: 1.1 } : {}}
        whileTap={value.trim() && !disabled ? { scale: 0.95 } : {}}
      >
        {isLoading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Send className="h-5 w-5" />
          </motion.div>
        ) : (
          <Send className="h-5 w-5" />
        )}
      </motion.button>
    </motion.div>
  );
}

/**
 * TypingIndicator - Shows typing status with animation
 */
export interface TypingIndicatorProps {
  users: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-2 text-sm text-muted-foreground mb-4"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-muted-foreground"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
      <span>
        {users.length === 1
          ? `${users[0]} is typing...`
          : `${users.length} people are typing...`}
      </span>
    </motion.div>
  );
}

/**
 * ChatHeader - Chat room header with member count and actions
 */
export interface ChatHeaderProps {
  title: string;
  description?: string;
  onlineCount?: number;
  memberCount?: number;
  actions?: React.ReactNode;
}

export function ChatHeader({
  title,
  description,
  onlineCount,
  memberCount,
  actions,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card rounded-t-xl">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {(onlineCount || memberCount) && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            {onlineCount !== undefined && (
              <>
                <motion.div
                  className="h-2 w-2 rounded-full bg-success"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>{onlineCount} online</span>
              </>
            )}
            {memberCount !== undefined && (
              <>
                <span>•</span>
                <span>{memberCount} members</span>
              </>
            )}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
