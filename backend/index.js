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
const _dirname = path.resolve();
const port = process.env.PORT || 8080;
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true,
  },
});

initIO(io);

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    addOnlineUser(userId, socket.id);
  }

  io.emit("getOnlineUsers", getOnlineUsers());

  socket.on("disconnect", () => {
    console.log("socket disconnected", socket.id);
    if (userId) {
      removeOnlineUser(userId);
      io.emit("getOnlineUsers", getOnlineUsers());
    }
  });
});

app.get("/", (req, res) => {
  res.send("server is running");
});

// Only load .js files from src/routes
readdirSync("./src/routes")
  .filter((file) => file.endsWith(".js"))
  .map((file) => {
    const routePath = `./src/routes/${file}`;
    console.log(`Loading route: ${routePath}`); // Debug log
    app.use("/", require(routePath));
  });

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(_dirname, "frontend", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(_dirname, "frontend", "build", "index.html"));
  });
}

server.listen(port, () => {
  console.log("Server is running on port 8080");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
