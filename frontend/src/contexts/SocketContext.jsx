import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    s.on('connect', () => setIsConnected(true));
    s.on('disconnect', () => setIsConnected(false));

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const joinCourse = (courseId) => socket?.emit('join-course', courseId);
  const leaveCourse = (courseId) => socket?.emit('leave-course', courseId);
  const onDiscussionCreated = (cb) => socket?.on('discussion:created', cb);
  const offDiscussionCreated = (cb) => socket?.off('discussion:created', cb);
  const onReplyAdded = (cb) => socket?.on('reply:added', cb);
  const offReplyAdded = (cb) => socket?.off('reply:added', cb);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
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
