// lib/socket.js
import { io } from 'socket.io-client';
import {useEffect, useState, useCallback} from "react";

const baseUrl = "http://localhost:8080";

// Create a single socket instance to be used by both functions
let socket = null;

// Socket connection manager without React hooks
export const ConnectionManager = {
    connect: (userId) => {
        // Initialize or reconnect socket if not already connected or userId changes
        if (!socket || socket.disconnected || socket.query?.userId !== userId) {
            if (socket) {
                socket.disconnect(); // Disconnect existing socket if it exists
                socket = null;
            }
            socket = io(baseUrl, {
                query: { userId },
                reconnection: true, // Enable automatic reconnection
            });

            socket.on('connect', () => {
                // console.log('Socket connected with userId:', userId);
                // Optionally emit an event to request online users immediately
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

// Custom hook for managing online users
export const useOnlineUsers = () => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        if (!userId) return; // Skip if no userId

        // Connect to socket when component mounts or userId changes
        const socketInstance = ConnectionManager.connect(userId);

        // Listen for online users updates
        socketInstance.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        // Clean up when component unmounts or userId changes
        return () => {
            socketInstance.off('getOnlineUsers');
        };
    }, [userId]); // Re-run effect when userId changes

    // Helper function to check if a user is online
    const isUserOnline = (userId) => {
        if (!userId || !onlineUsers || !onlineUsers.length) return false;
        return onlineUsers.includes(userId.toString());
    };

    return { onlineUsers, isUserOnline };
};

// Custom hook for handling new messages
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