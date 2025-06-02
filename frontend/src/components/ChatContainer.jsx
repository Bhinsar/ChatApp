import React, {useEffect, useState, useRef} from 'react'
import ChatHeader from "./ChatHeder.jsx";
import MessageSkeleten from "./Skeleten/MessageSkeleten.jsx";
import MessageInput from "./MessageInput.jsx";
import {axiosInstance} from "../lib/axois";

function ChatContainer({selectedUser, setSelectedUser, getMessages, isMessageLoading, messages, onlineUsers, isUserOnline, getUsers}) {
    const [authUser, setAuthUser] = useState({});
    const messageEndRef = useRef(null);

    // Function to format message time
    const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};


    useEffect(() => {
        // Fetch the authenticated user
        const getAuthUser = async () => {
            try {
                const res = await axiosInstance("/user/profile");
                setAuthUser(res.data.data);
            } catch (err) {
                console.log(err);
            }
        };
        getAuthUser();
    }, []);

    useEffect(() => {
        getMessages(selectedUser._id)
    }, [selectedUser]);

    useEffect(() => {
        // Scroll to the latest message
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (isMessageLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} onlineUsers={onlineUsers} isUserOnline={isUserOnline}/>
                <MessageSkeleten/>
                <MessageInput selectedUser={selectedUser} getMessages={getMessages} getUsers={getUsers}/>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            <ChatHeader selectedUser={selectedUser} setSelectedUser={setSelectedUser} onlineUsers={onlineUsers} isUserOnline={isUserOnline}/>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                        ref={index === messages.length - 1 ? messageEndRef : null}
                    >
                        <div className=" chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? authUser.profilePic || "/avatar.png"
                                            : selectedUser.profilePic || "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <MessageInput selectedUser={selectedUser} getMessages={getMessages} getUsers={getUsers}/>
        </div>
    )
}

export default ChatContainer
