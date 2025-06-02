const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("node:http");
const {
  initIO,
  addOnlineUser,
  removeOnlineUser,
  getOnlineUsers,
} = require("./src/lib/socket");
const path = require("path");

dotenv.config();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL 
      : "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));

const server = http.createServer(app);

const io = new Server(server, {
  cors: corsOptions,
});

initIO(io);

io.on("connection", (socket) => {
  console.log("Socket.IO connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    addOnlineUser(userId, socket.id);
  }

  io.emit("getonlineusers", getOnlineUsers()); // Match frontend event name

  socket.on("disconnect", () => {
    console.log("Socket.IO disconnected:", socket.id);
    if (userId) {
      removeOnlineUser(userId);
      io.emit("getonlineusers", getOnlineUsers());
    }
  });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Replace the route loading section with this:
const userRoutes = require('./src/routes/userRoute');
const messageRoutes = require('./src/routes/messageRoute');

// Mount routes with explicit paths
app.use('/api/user', userRoutes);
app.use('/api/messages', messageRoutes);

// API routes should come before the static file handling
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));
