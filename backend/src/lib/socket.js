// Store the Socket.io instance
let io;

// Store online users mapping (userId -> socketId)
const onlineUsers = {};

// Initialize the io instance
exports.initIO = (socketIO) => {
    io = socketIO;
    return io;
};

// Get the io instance
exports.getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Add an online user
exports.addOnlineUser = (userId, socketId) => {
    onlineUsers[userId] = socketId;
};

// Remove an online user
exports.removeOnlineUser = (userId) => {
    delete onlineUsers[userId];
};

// Get all online users
exports.getOnlineUsers = () => {
    // Convert the user IDs to strings to ensure they can be compared with MongoDB ObjectIds
    return Object.keys(onlineUsers);
};

// Get a user's socket ID
exports.getUserSocketId = (userId) => {
    return onlineUsers[userId];
};
