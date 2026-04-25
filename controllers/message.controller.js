const Message = require("../models/message.model");
const User = require("../models/user.model");
const ArchivedMessage = require("../models/archieve.model");
const { Op } = require("sequelize");

// ------------------
// SEND MESSAGE (REST fallback)
// ------------------
exports.sendMessage = async (req, res) => {
    try {
        const { message, roomId } = req.body;
        const userId = req.user.id;

        if (!roomId || !message) {
            return res.status(400).json({ message: "roomId and message are required" });
        }

        const newMessage = await Message.create({
            message,
            userId,
            roomId
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
// GET MESSAGES BY ROOM
// ------------------
exports.getMessagesByRoom = async (req, res) => {

    try {

        const { roomId } = req.params;
        const currentUser = await User.findByPk(req.user.id, {
            attributes: ["id", "groupId"]
        });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.groupId || String(currentUser.groupId) !== String(roomId)) {
            return res.status(403).json({ message: "You are not part of this group" });
        }
        const recentMessages = await Message.findAll({
            where: {
                roomId
            }
        });

        const archivedMessages = await ArchivedMessage.findAll({
            where: {
                roomId
            }
        });

        const allMessages = [...archivedMessages, ...recentMessages]
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        res.json(allMessages);

    } catch (err) {

        console.log("❌ Fetch error:", err);
        res.status(500).json({ error: err.message });

    }

};

// ------------------
// CLEAR ROOM MESSAGES
// ------------------
exports.clearRoomMessages = async (req, res) => {

    try {

        const { roomId } = req.params;
        const currentUser = await User.findByPk(req.user.id, {
            attributes: ["id", "groupId"]
        });

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.groupId || String(currentUser.groupId) !== String(roomId)) {
            return res.status(403).json({ message: "You are not part of this group" });
        }
        await Message.destroy({
            where: {
                roomId
            }
        });

        res.json({ message: "Chat cleared successfully" });

    } catch (err) {

        console.log("❌ Clear chat error:", err);
        res.status(500).json({ message: "Failed to clear chat" });

    }

};

