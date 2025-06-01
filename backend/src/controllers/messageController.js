const Message = require("../models/messageModel");
const User = require("../models/userModel");
const cloudinary = require("../helper/cloudinary");
const { getIO, getUserSocketId } = require("../lib/socket");

//get all message
exports.getMessages = async (req, res) => {
    try {
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        const messages = await Message.find({
            $or: [
                { senderId: senderId, receiverId: receiverId },
                { senderId: receiverId, receiverId: senderId }
            ]
        }).sort({createdAt: 1})

       res.status(200).json(messages);

    }catch(error){
        console.log(error);
        res.status(500).json({message: error.message});

    }
}

//send message
exports.sendMessage = async (req, res) => {
    try {
        const {id:receiverId} = req.params;
        const senderId = req.user._id;
        const {text, image} = req.body;

        const receiver = await User.findById(receiverId);
        if(!receiver){
            return res.status(400).json({
                warning: true,
                message: "Receiver does not exist"
            });
        }
        const sender = await User.findById(senderId);
        if(!sender){
            return res.status(400).json({
                warning: true,
                message: "Sender does not exist"
            });
        }

        let imageUrl;
        if(image){
            const cloudinaryResponse = await cloudinary.uploader.upload(image);
            imageUrl = cloudinaryResponse.secure_url;
        } 

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        });
        //todo: realtime functionality

        const io = getIO();
        const receiverSocketId = getUserSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(200).json(newMessage);
    }catch(error){
        console.log(error);
        res.status(500).json({message: error.message});

    }
}
