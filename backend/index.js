const express = require("express");
const app = express();
const readdirSync = require("fs").readdirSync;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const {Server} = require("socket.io");
const http = require("node:http");
const { initIO, addOnlineUser, removeOnlineUser, getOnlineUsers } = require("./src/lib/socket");
const path = require("path");

dotenv.config();
const __dirname = path.resolve();
const port = process.env.PORT || 8080;
app.use(express.json({limit: "10mb"}));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FrontEnd_url || "http://localhost:3000", // frontend origin
    credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [process.env.FrontEnd_url || "http://localhost:3000"],
        credentials: true
    }
});

// Initialize the io instance for use in other modules
initIO(io);

io.on("connection", (socket) => {
    console.log("socket connected", socket.id);

    const userId = socket.handshake.query.userId;
    if(userId){
        // Add user to online users
        addOnlineUser(userId, socket.id);
    }

    // Emit to all clients including the newly connected one
    io.emit("getOnlineUsers", getOnlineUsers());

    // // Also emit specifically to the newly connected socket
    // socket.emit("getonlineusers", getOnlineUsers());

    socket.on("disconnect", () => {
        console.log("socket disconnected", socket.id);
        if(userId) {
            // Remove user from online users
            removeOnlineUser(userId);
            io.emit("getOnlineUsers", getOnlineUsers());
        }
    });

});

app.get("/", (req, res) => {
    res.send("server is running");
});

readdirSync("./src/routes").map((file) => {
    const routePath = `./src/routes/${file}`;
    app.use("/", require(routePath));
});

if (process.env.NODE_ENV === "production") {
    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, "frontend", "build")));

    // Handle any requests that don't match the above routes
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "frontend", "build", "index.html"));
    });
}

server.listen(port, () => {
    console.log("Server is running on port 8080");
});

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
