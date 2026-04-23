const Message = require("../../models/message.model");

module.exports = (io, socket) => {

    // ✅ Join personal room
    socket.on("join_room", ({ room }) => {

        if (!room) return;

        socket.join(room);
        console.log(`👤 User ${socket.user.id} joined room ${room}`);
    });

    // ✅ Send personal message
    socket.on("new_message", async ({ room, message }) => {

        try {

            if (!room || !message) return;

            const senderId = socket.user.id;

            // OPTIONAL: extract receiverId from room
            const [user1, user2] = room.split("_");
            const receiverId = user1 == senderId ? user2 : user1;

            // Save to DB
            const savedMessage = await Message.create({
                message,
                userId: senderId,
                receiverId
            });

            // Send only to that room
            io.to(room).emit("new_message", {
                id: savedMessage.id,
                message: savedMessage.message,
                userId: senderId,
                receiverId,
                createdAt: savedMessage.createdAt
            });

        } catch (err) {
            console.log("❌ Personal chat error:", err);
        }

    });

};