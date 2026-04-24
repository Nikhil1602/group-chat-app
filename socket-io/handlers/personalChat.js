const Message = require("../../models/message.model");

module.exports = (io, socket) => {

    console.log("Socket user:", socket.user);

    // JOIN ROOM
    socket.on("join_room", ({ room }) => {

        if (!room) {
            console.log("❌ No room provided");
            return;
        }

        socket.join(room);

        console.log(`👤 User ${socket.user.id} joined ${room}`);

        socket.emit("room_joined", { room });

    });


    // SEND MESSAGE
    socket.on("new_message", async ({ room, message }) => {

        try {

            if (!room || !message) {
                console.log("❌ Missing room/message");
                return;
            }

            const senderId = socket.user.id;

            const [user1, user2] = room.split("_").map(Number);

            if (!user1 || !user2) {
                console.log("❌ Invalid room format:", room);
                return;
            }

            const receiverId = senderId === user1 ? user2 : user1;

            const savedMessage = await Message.create({
                message,
                userId: senderId,
                receiverId
            });

            io.to(room).emit("new_message", {
                id: savedMessage.id,
                message: savedMessage.message,
                userId: senderId,
                receiverId,
                createdAt: savedMessage.createdAt
            });

        } catch (err) {
            console.log("❌ Message error:", err);
        }

    });


    // SEND MEDIA
    socket.on("send_media", ({ room, fileUrl }) => {

        if (!room || !fileUrl) return;

        io.to(room).emit("new_message", {
            type: "media",
            fileUrl,
            userId: socket.user.id,
            createdAt: new Date()
        });

    });

};