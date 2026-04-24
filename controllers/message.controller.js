const Message = require("../models/message.model");
const User = require("../models/user.model");
const ArchivedMessage = require("../models/archieve.model");
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

        const [user1, user2] = roomId.split("_").map(Number);

        // 🔥 Get recent messages
        const recentMessages = await Message.findAll({
            where: {
                [Op.or]: [
                    { userId: user1, receiverId: user2 },
                    { userId: user2, receiverId: user1 }
                ]
            }
        });

        // 🔥 Get archived messages
        const archivedMessages = await ArchivedMessage.findAll({
            where: {
                [Op.or]: [
                    { userId: user1, receiverId: user2 },
                    { userId: user2, receiverId: user1 }
                ]
            }
        });

        // 🔥 Merge + sort
        const allMessages = [...archivedMessages, ...recentMessages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(allMessages);

    } catch (err) {

        console.log("❌ Fetch error:", err);
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

