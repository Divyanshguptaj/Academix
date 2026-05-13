import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [failed, setFailed] = useState(false);       // true after max retries exhausted
  const [active, setActive] = useState(false);       // true only when a page requests the socket

  const connect = useCallback(() => {
    if (socketRef.current) return;                   // already connected or connecting

    setFailed(false);

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 10000,
    });

    s.on('connect',            () => { setIsConnected(true);  setFailed(false); });
    s.on('disconnect',         () => setIsConnected(false));
    s.on('connect_error',      () => setIsConnected(false));
    s.on('reconnect_failed',   () => { setIsConnected(false); setFailed(true); });

    socketRef.current = s;
    setActive(true);
  }, []);

  const disconnect = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setIsConnected(false);
    setActive(false);
  }, []);

  // Clean up on unmount
  useEffect(() => () => disconnect(), [disconnect]);

  const joinCourse         = (courseId) => socketRef.current?.emit('join-course', courseId);
  const leaveCourse        = (courseId) => socketRef.current?.emit('leave-course', courseId);
  const onDiscussionCreated  = (cb)     => socketRef.current?.on('discussion:created', cb);
  const offDiscussionCreated = (cb)     => socketRef.current?.off('discussion:created', cb);
  const onReplyAdded         = (cb)     => socketRef.current?.on('reply:added', cb);
  const offReplyAdded        = (cb)     => socketRef.current?.off('reply:added', cb);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      isConnected,
      failed,
      active,
      connect,
      disconnect,
      joinCourse,
      leaveCourse,
      onDiscussionCreated,
      offDiscussionCreated,
      onReplyAdded,
      offReplyAdded,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
