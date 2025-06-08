import { useAuth } from '@/hooks/use-auth';
import { useWebSocket } from '@/hooks/use-websocket';
import { createContext, ReactNode, useContext } from 'react';

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
    console.warn('WebSocket connection not initialized');
    return false;
  },
  isAuthenticated: false,
  status: 'closed'
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
  const { status, sendMessage, isConnected } = useWebSocket({
    token: token || undefined,
    path: '/ws', // Specify a dedicated WebSocket path
    disabled: !isAuthenticated, // Only disable if not authenticated
    onMessage: (data) => {
      console.log('WebSocket message received:', data);
    },
    onOpen: () => {
      console.log('WebSocket connection opened successfully');
    },
    onError: (error) => {
      console.warn('WebSocket error:', error);
    },
    onClose: () => {
      console.log('WebSocket connection closed');
    },
    reconnectOnClose: true
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