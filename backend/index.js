const express = require("express");
const app = express();
const readdirSync = require("fs").readdirSync;
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

dotenv.config();

const port = process.env.PORT || 8080;
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000", // frontend origin
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("server is running");
});

readdirSync("./src/routes").map((file) => {
  const routePath = `./src/routes/${file}`;
  app.use("/", require(routePath));
});

app.listen(port, () => {
  console.log("Server is running on port 8080");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));
