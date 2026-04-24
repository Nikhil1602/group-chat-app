const Message = require("../models/message.model");
const User = require("../models/user.model");
const { Op } = require("sequelize");

// ------------------
// SEND MESSAGE (REST fallback)
// ------------------
exports.sendMessage = async (req, res) => {
    try {
        const { message, receiverId } = req.body;
        const userId = req.user.id;

        const newMessage = await Message.create({
            message,
            userId,
            receiverId
        });

        res.json({
            message: "Message stored",
            data: newMessage
        });


    } catch (err) {

        res.status(500).json({ error: err.message });

    }

};

// ------------------
// GET ALL (DEBUG)
// ------------------
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

// ------------------
// ✅ GET MESSAGES BY ROOM
// ------------------
exports.getMessagesByRoom = async (req, res) => {

    try {

        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({ message: "Room ID required" });
        }

        // roomId = "1_5"
        const [user1, user2] = roomId.split("_").map(Number);

        if (!user1 || !user2) {
            return res.status(400).json({ message: "Invalid room format" });
        }

        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { userId: user1, receiverId: user2 },
                    { userId: user2, receiverId: user1 }
                ]
            },
            order: [["createdAt", "ASC"]]
        });

        res.json(messages);

    } catch (err) {

        console.log("❌ Fetch room messages error:", err);
        res.status(500).json({ error: err.message });

    }

};

exports.clearRoomMessages = async (req, res) => {

    try {

        const { roomId } = req.params;

        const [user1, user2] = roomId.split("_").map(Number);

        await Message.destroy({
            where: {
                [require("sequelize").Op.or]: [
                    { userId: user1, receiverId: user2 },
                    { userId: user2, receiverId: user1 }
                ]
            }
        });

        res.json({ message: "Chat cleared successfully" });

    } catch (err) {

        console.log("❌ Clear chat error:", err);
        res.status(500).json({ message: "Failed to clear chat" });

    }

};