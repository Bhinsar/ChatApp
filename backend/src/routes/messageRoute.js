const express = require("express");
const {authMiddleware} = require("../middleware/authMiddleware");
const {getMessages, sendMessage} = require("../controllers/messageController");
const router = express.Router();

router.get("/get/:id", authMiddleware, getMessages)
router.post("/send/:id", authMiddleware, sendMessage)


module.exports = router;