import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { socketService } from '../services/socketService';

interface SocketContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext debe usarse dentro de SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = async () => {
    try {
      setError(null);
      console.log('🔌 Conectando al servidor WebSocket...');
      await socketService.connect();
      setIsConnected(true);
      console.log('✅ Conectado al servidor WebSocket');
    } catch (err) {
      console.error('❌ Error conectando al WebSocket:', err);
      setError(err instanceof Error ? err.message : 'Error de conexión');
      setIsConnected(false);
    }
  };

  const disconnect = () => {
    console.log('🔌 Desconectando del servidor WebSocket...');
    socketService.disconnect();
    setIsConnected(false);
  };

  // Conectar al montar: la lista de lobbies es pública y la sesión puede crearse después (Auth)
  useEffect(() => {
    connect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  // Listener para estado de conexión
  useEffect(() => {
    const handleConnect = () => {
      console.log('🟢 Socket conectado');
      setIsConnected(true);
      setError(null);
      // NOTE: lobby reconnection logic is handled by useGame hook
      // to avoid duplicate reconnection attempts from multiple places
    };

    const handleDisconnect = () => {
      console.log('🔴 Socket desconectado');
      setIsConnected(false);
    };

    const handleError = (error: Error) => {
      console.error('❌ Error de socket:', error);
      setError(error.message);
      setIsConnected(false);
    };

    // Añadir listeners
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('connect_error', handleError);

    return () => {
      // Limpiar listeners
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('connect_error', handleError);
    };
  }, []);

  const value: SocketContextType = {
    isConnected,
    connect,
    disconnect,
    error,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};