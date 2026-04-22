const Message = require("../models/message.model");

exports.sendMessage = async (req, res) => {

    try {

        const { message } = req.body;
        const userId = req.user.id; // from token

        const newMessage = await Message.create({
            message,
            userId
        });

        res.json({
            message: "Message stored",
            data: newMessage
        });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};