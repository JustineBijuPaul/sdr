import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';

// Define WebSocket status types for compatibility
type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error' | 'unsupported';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (data: any) => boolean;
  isAuthenticated: boolean;
  status: WebSocketStatus;
}

// Create a default context with disabled functionality
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  sendMessage: () => {
    console.warn('WebSockets are disabled in this application');
    return false;
  },
  isAuthenticated: false,
  status: 'unsupported'
});

/**
 * WebSocket provider that connects to the backend when a user is authenticated.
 * If no WebSocket server is available, it will automatically handle the fallback.
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  
  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Only attempt WebSocket connection if we have a token
  // Convert null to undefined to satisfy the type constraint
  const { status, sendMessage, isConnected } = useWebSocket({
    token: token || undefined, // Convert null to undefined
    path: '/',
    disabled: true, // Disable WebSocket connections completely
  });

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        sendMessage,
        isAuthenticated,
        status
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}