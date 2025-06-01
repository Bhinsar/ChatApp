import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

const baseUrl = import.meta.env.MODE === 'development'
  ? 'http://localhost:8080'
  : import.meta.env.VITE_BACKEND_URL;

// ✅ This line must be at the top-level scope
let socket = null;


export const ConnectionManager = {
  connect: (userId) => {
    if (!userId) return;

    if (!socket || socket.disconnected || socket.query?.userId !== userId) {
      if (socket) socket.disconnect();

      socket = io(baseUrl, {
        query: { userId },
        reconnection: true,
      });

      socket.on("connect", () => {
        socket.emit("requestOnlineUsers");
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
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

  getSocket: () => socket,
};

// Custom hook for managing online users
export const useOnlineUsers = (userId) => {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const socketInstance = ConnectionManager.connect(userId);

    socketInstance.on("getonlineusers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketInstance.off("getonlineusers");
    };
  }, [userId]);

  const isUserOnline = (id) => {
    return onlineUsers.includes(id?.toString());
  };

  return { onlineUsers, isUserOnline };
};

// Custom hook for handling new messages
export const useNewMessageListener = (selectedUser, setMessages) => {
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId || !selectedUser) return;

    const socketInstance = ConnectionManager.connect(userId);

    socketInstance.on("newMessage", (newMessage) => {
      if (
        (newMessage.senderId === selectedUser._id &&
          newMessage.receiverId === userId) ||
        (newMessage.senderId === userId &&
          newMessage.receiverId === selectedUser._id)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        console.log("New message received:", newMessage);
      }
    });

    return () => {
      socketInstance.off("newMessage");
    };
  }, [userId, selectedUser, setMessages]);
};
