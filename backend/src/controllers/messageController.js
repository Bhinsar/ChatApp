const Message = require("../models/messageModel");

//get all message
exports.getMessages = async (req, res) => {
    try {
        const {id:reciverId} = req.params;
        const senderId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId, reciverId},
                {senderId: reciverId, reciverId: senderId}
            ]
        })
        .sort({createdAt: 1})

       res.status(200).json(messages);

    }catch(error){
        console.log(error);
        res.status(500).json({message: error.message});

    }
}

//send message
exports.sendMessage = async (req, res) => {
    try {
        const {id:reciverId} = req.params;
        const senderId = req.user._id;
        const {test, image} = req.body;

        let imageUrl;
        if(image){
            const cloudinaryResponse = await cloudinary.uploader.upload(image);
            imageUrl = cloudinaryResponse.secure_url;
        } 

        const newMessage = await Message.create({
            senderId,
            reciverId,
            test,
            image: imageUrl
        });
        //todo: realtime functionality
        res.status(200).json(newMessage);
    }catch(error){
        console.log(error);
        res.status(500).json({message: error.message});

    }
}