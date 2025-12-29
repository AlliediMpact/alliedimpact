'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface UseWebSocketOptions {
  url?: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({
  url = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
  reconnect = true,
  reconnectInterval = 3000,
  reconnectAttempts = 5,
  onOpen,
  onClose,
  onError,
  onMessage,
}: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectCountRef.current = 0;
        onOpen?.();
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();

        // Attempt to reconnect
        if (reconnect && reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current += 1;
          console.log(
            `Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})...`
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(message);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [url, reconnect, reconnectInterval, reconnectAttempts, onOpen, onClose, onError, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', data);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    send,
    disconnect,
    reconnect: connect,
  };
}

// Transaction Feed Hook
export function useTransactionFeed() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeUsers: 0,
    completedToday: 0,
  });

  const { isConnected, lastMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'transaction:new':
          setTransactions((prev) => [message.data, ...prev].slice(0, 10));
          break;
        case 'transaction:update':
          setTransactions((prev) =>
            prev.map((tx) => (tx.id === message.data.id ? message.data : tx))
          );
          break;
        case 'stats:update':
          setStats(message.data);
          break;
        default:
          break;
      }
    },
  });

  return {
    transactions,
    stats,
    isConnected,
  };
}

// Price Ticker Hook
export function usePriceTicker(symbols: string[] = ['BTC', 'ETH', 'USDT']) {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});

  const { isConnected } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'price:update' && symbols.includes(message.data.symbol)) {
        setPrices((prev) => ({
          ...prev,
          [message.data.symbol]: {
            price: message.data.price,
            change: message.data.change,
          },
        }));
      }
    },
    onOpen: () => {
      // Subscribe to price updates for specified symbols
      console.log('Subscribing to price updates for:', symbols);
    },
  });

  return {
    prices,
    isConnected,
  };
}
