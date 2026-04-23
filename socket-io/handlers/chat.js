const Message = require("../../models/message.model");

module.exports = (io, socket) => {

    socket.on("chat-message", async (data) => {
        try {
            const userId = socket.user.id;
            const { message } = data;

            const savedMessage = await Message.create({
                message,
                userId
            });

            io.emit("chat-message", {
                id: savedMessage.id,
                message: savedMessage.message,
                userId: savedMessage.userId,
                createdAt: savedMessage.createdAt
            });

        } catch (err) {
            console.log("Chat Handler Error:", err);
        }
    });

};