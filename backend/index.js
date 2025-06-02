const express = require("express");
const app = express();
const readdirSync = require("fs").readdirSync;
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
      ? process.env.FRONTEND_URL || "https://your-frontend.onrender.com"
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

// Load routes with debugging
readdirSync("./src/routes")
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    const route = require(`./src/routes/${file}`);
    // Mount routes with specific base paths
    if (file === "userRoutes.js") {
      app.use("/api", route);
    } else if (file === "messageRoutes.js") {
      app.use("/api", route);
    }
  });

// In production, serve static files and handle client-side routing
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
  });
}

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err.message));
