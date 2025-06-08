import { useEffect, useRef, useState } from 'react';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error' | 'unsupported';

interface UseWebSocketProps {
  path?: string;
  token?: string;
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectOnClose?: boolean;
  disabled?: boolean; // New prop to disable WebSocket
}

export function useWebSocket({
  path = '',
  token,
  onMessage,
  onOpen,
  onClose,
  onError,
  reconnectOnClose = true,
  disabled = false, // Default to enabled
}: UseWebSocketProps = {}) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const [error, setError] = useState<Event | null>(null);
  const connectionAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const isConnectingRef = useRef(false);
  const wsSupported = typeof WebSocket !== 'undefined';

  // Memoize callbacks to prevent effect from running too often
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onMessageRef.current = onMessage;
    onOpenRef.current = onOpen;
    onCloseRef.current = onClose;
    onErrorRef.current = onError;
  });

  useEffect(() => {
    // Early returns for cases where we shouldn't connect
    if (disabled) {
      setStatus('closed');
      return;
    }
    
    if (!wsSupported) {
      console.warn('WebSockets are not supported in this environment');
      setStatus('unsupported');
      return;
    }
    
    if (!token) {
      setStatus('closed');
      return;
    }

    // Don't create multiple connections
    if (isConnectingRef.current || (socket && socket.readyState !== WebSocket.CLOSED)) {
      return;
    }

    // Limit reconnection attempts
    if (connectionAttemptsRef.current > 3) {
      console.warn('WebSocket connection attempts exceeded, stopping reconnection attempts');
      setStatus('error');
      return;
    }

    isConnectingRef.current = true;

    // Get the current hostname from window location
    const hostname = window.location.hostname || 'localhost';
    
    // Create the WebSocket URL - always connect to backend server port
    let wsUrl;
    try {
      console.log(`[WS] Building URL with path: "${path}"`);
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // In development, always connect to the backend server port (7822)
        // regardless of which port the frontend is served from
        const backendPort = '7822';
        console.log('Using WebSocket port:', backendPort);
        wsUrl = `ws://${hostname}:${backendPort}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
      } else {
        // In production, use the same host and let the server handle port mapping
        const portPart = window.location.port && window.location.port !== '' ? `:${window.location.port}` : '';
        wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${hostname}${portPart}${path}${path.includes('?') ? '&' : '?'}token=${token}`;
      }
    } catch (error) {
      console.error('Error building WebSocket URL:', error);
      wsUrl = `ws://localhost:7822${path}${path.includes('?') ? '&' : '?'}token=${token}`;
    }
    
    // Log the websocket URL for debugging (strip token for security)
    const debugUrl = wsUrl.replace(/token=([^&]*)/, 'token=REDACTED');
    console.log(`[WS] Attempting connection ${connectionAttemptsRef.current + 1}/4 to: ${debugUrl}`);
    
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      setSocket(ws);
      setStatus('connecting');
      
      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (ws && ws.readyState !== WebSocket.OPEN) {
          console.warn('WebSocket connection timed out');
          isConnectingRef.current = false;
          ws.close();
          setStatus('error');
          
          if (reconnectOnClose && connectionAttemptsRef.current < 3) {
            const backoffTime = Math.min(3000 * Math.pow(2, connectionAttemptsRef.current), 30000);
            connectionAttemptsRef.current += 1;
            
            if (reconnectTimeoutRef.current) {
              window.clearTimeout(reconnectTimeoutRef.current);
            }
            
            reconnectTimeoutRef.current = window.setTimeout(() => {
              setSocket(null);
              reconnectTimeoutRef.current = null;
            }, backoffTime);
          }
        }
      }, 5000);
      
      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        setStatus('open');
        connectionAttemptsRef.current = 0; // Reset connection attempts on successful connection
        console.log('[WS] Connection established successfully');
        if (onOpenRef.current) onOpenRef.current();
      };
      
      ws.onmessage = (event) => {
        if (onMessageRef.current) {
          try {
            const data = JSON.parse(event.data);
            onMessageRef.current(data);
          } catch (e) {
            onMessageRef.current(event.data);
          }
        }
      };
      
      ws.onclose = () => {
        clearTimeout(connectionTimeout);
        isConnectingRef.current = false;
        setStatus('closed');
        if (onCloseRef.current) onCloseRef.current();
        
        // Auto reconnect logic with exponential backoff
        if (reconnectOnClose && connectionAttemptsRef.current < 3) {
          const backoffTime = Math.min(3000 * Math.pow(2, connectionAttemptsRef.current), 30000);
          connectionAttemptsRef.current += 1;
          
          if (reconnectTimeoutRef.current) {
            window.clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            setSocket(null);
            reconnectTimeoutRef.current = null;
          }, backoffTime);
        }
      };
      
      ws.onerror = (event) => {
        // Just log the first error to prevent console spam
        if (connectionAttemptsRef.current === 0) {
          console.warn('[WS] WebSocket error occurred - this may be normal if no WebSocket server is available');
        }
        
        isConnectingRef.current = false;
        // Don't set error status immediately, let the connection timeout or close handlers deal with it
        setError(event);
        if (onErrorRef.current) onErrorRef.current(event);
      };
    } catch (error) {
      // Only log the first error to prevent console spam
      if (connectionAttemptsRef.current === 0) {
        console.warn('WebSocket initialization error - this may be normal if no WebSocket server is available');
      }
      
      isConnectingRef.current = false;
      setStatus('error');
      
      // Try to reconnect after error with exponential backoff if this isn't our last attempt
      if (reconnectOnClose && connectionAttemptsRef.current < 3) {
        const backoffTime = Math.min(3000 * Math.pow(2, connectionAttemptsRef.current), 30000);
        connectionAttemptsRef.current += 1;
        
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          setSocket(null);
          reconnectTimeoutRef.current = null;
        }, backoffTime);
      }
    }
    
    // Cleanup function
    return () => {
      isConnectingRef.current = false;
      if (ws) {
        ws.close();
      }
      
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [path, token, reconnectOnClose, disabled, wsSupported]);
  
  const sendMessage = (data: any) => {
    if (socket && status === 'open') {
      try {
        socket.send(typeof data === 'string' ? data : JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    }
    return false;
  };
  
  return {
    socket,
    status,
    error,
    sendMessage,
    isConnecting: status === 'connecting',
    isConnected: status === 'open',
    isClosed: status === 'closed',
    isError: status === 'error',
    isUnsupported: status === 'unsupported'
  };
} 