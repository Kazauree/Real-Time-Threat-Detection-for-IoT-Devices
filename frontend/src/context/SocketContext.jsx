import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

// Same-origin by default (proxied by Vite in dev). Set VITE_SOCKET_URL to use an external realtime host.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [livePredictions, setLivePredictions] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('[+] Connected to IoT Threat Detection WebSocket Feed');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('[-] Disconnected from WebSocket Feed');
      setIsConnected(false);
    });

    newSocket.on('new_traffic_prediction', (data) => {
      setLivePredictions((prev) => [data, ...prev.slice(0, 49)]);
    });

    newSocket.on('new_threat_alert', (alertData) => {
      setLiveAlerts((prev) => [alertData, ...prev.slice(0, 19)]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearAlerts = () => setLiveAlerts([]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        livePredictions,
        liveAlerts,
        clearAlerts,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
