import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const baseUrl = import.meta.env.MODE === 'development' ? 'http://localhost:8080' : '';

// Use a closure to manage the socket instance
const ConnectionManager = (() => {
  let socket = null;

  return {
    connect: (userId) => {
      if (!socket || socket.disconnected || socket.query?.userId !== userId) {
        if (socket) {
          socket.disconnect();
          socket = null;
        }
        socket = io(baseUrl, {
          query: { userId },
          reconnection: true,
        });

        socket.on('connect', () => {
          socket.emit('requestOnlineUsers');
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      }
      return socket;
    },
    disconnect: () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    },
  };
})();

export { ConnectionManager };

export const useOnlineUsers = () => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    const socketInstance = ConnectionManager.connect(userId);

    socketInstance.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketInstance.off('getOnlineUsers');
    };
  }, [userId]);

  const isUserOnline = (userId) => {
    if (!userId || !onlineUsers || !onlineUsers.length) return false;
    return onlineUsers.includes(userId.toString());
  };

  return { onlineUsers, isUserOnline };
};

export const useNewMessageListener = (selectedUser, setMessages) => {
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId || !selectedUser) return;

    const socketInstance = ConnectionManager.connect(userId);

    socketInstance.on('newMessage', (newMessage) => {
      if (
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === userId) ||
        (newMessage.senderId === userId && newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log('New message received:', newMessage);
      }
    });

    return () => {
      socketInstance.off('newMessage');
    };
  }, [userId, selectedUser, setMessages]);
};