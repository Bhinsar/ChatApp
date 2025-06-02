import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axois.js';
import Sidebar from '../components/Sidebar';
import NoChatSelected from '../components/NoChateSelected.jsx';
import ChatContainer from '../components/ChatContainer';
import { useOnlineUsers, useNewMessageListener } from '../lib/socket.js';

function Home() {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserLoading, setUserLoading] = useState(false);
    const [isMessageLoading, setMessageLoading] = useState(false);

    const { onlineUsers, isUserOnline } = useOnlineUsers();

    useNewMessageListener(selectedUser, setMessages);

    const getUsers = async (loading = true) =>  {
        try {
            setUserLoading(loading);
            const res = await axiosInstance.get('/user/sidebar');
            setUsers(res.data.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setUserLoading(false);
        }
    };

    const getMessages = async (userId, loading = true) => {
        try {
            setMessageLoading(loading);
            const res = await axiosInstance.get(`/messages/get/${userId}`);
            setMessages(res.data);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setMessageLoading(false);
        }
    };

    useEffect(() => {
        getUsers();
    }, []);

    return (
        <div className="h-screen bg-base-200">
            <div className="flex items-center justify-center pt-20 px-4">
                <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)]">
                    <div className="flex h-full rounded-lg overflow-hidden">
                        <Sidebar
                            users={users}
                            isUserLoading={isUserLoading}
                            getUsers={getUsers}
                            selectedUser={selectedUser}
                            setSelectedUser={setSelectedUser}
                            getMessages={() => (selectedUser ? getMessages(selectedUser._id) : null)}
                            onlineUsers={onlineUsers}
                            isUserOnline={isUserOnline}
                        />
                        {!selectedUser ? (
                            <NoChatSelected />
                        ) : (
                            <ChatContainer
                                selectedUser={selectedUser}
                                setSelectedUser={setSelectedUser}
                                getMessages={getMessages}
                                isMessageLoading={isMessageLoading}
                                setMessageLoading={setMessageLoading} // Pass setMessageLoading
                                messages={messages}
                                onlineUsers={onlineUsers}
                                isUserOnline={isUserOnline}
                                getUsers={getUsers}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;