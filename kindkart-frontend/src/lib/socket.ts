import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

class SocketManager {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(socketUrl, {
      auth: {
        token: `Bearer ${token}`
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: this.maxReconnectAttempts
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Reconnected after', attemptNumber, 'attempts');
      this.reconnectAttempts = 0;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Chat-related socket methods
  joinChat(requestId: string) {
    if (this.socket) {
      this.socket.emit('join-chat', { requestId });
    }
  }

  leaveChat(requestId: string) {
    if (this.socket) {
      this.socket.emit('leave-chat', { requestId });
    }
  }

  sendMessage(requestId: string, content: string, receiverId: string) {
    if (this.socket) {
      this.socket.emit('send-message', {
        requestId,
        content,
        receiverId
      });
    }
  }

  // Listen for new messages
  onNewMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Listen for typing indicators
  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    if (this.socket) {
      this.socket.on('typing', callback);
    }
  }

  // Send typing indicator
  sendTyping(requestId: string, receiverId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', {
        requestId,
        receiverId,
        isTyping
      });
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // Remove specific listener
  removeListener(event: string, callback?: Function) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.removeAllListeners(event);
      }
    }
  }
}

// Singleton instance
export const socketManager = new SocketManager();

// Hook for using socket in React components
export function useSocket() {
  const { accessToken, isAuthenticated } = useAuthStore();

  const connect = () => {
    if (isAuthenticated && accessToken) {
      return socketManager.connect(accessToken);
    }
    return null;
  };

  const disconnect = () => {
    socketManager.disconnect();
  };

  return {
    socket: socketManager.getSocket(),
    connect,
    disconnect,
    socketManager
  };
}
