const Message = require("../models/message.model");
const User = require("../models/user.model");

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

exports.getMessages = async (req, res) => {

    try {

        const messages = await Message.findAll({
            include: [
                {
                    model: User,
                    attributes: ["id", "name"]
                }
            ],
            order: [["createdAt", "ASC"]]
        });

        res.json(messages);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};