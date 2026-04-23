const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");

function initSocket(server) {

    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    // Apply middleware
    io.use(socketMiddleware);

    // Handle connections
    io.on("connection", (socket) => {
        console.log("🔌 Connected:", socket.user.id);

        // Register handlers
        chatHandler(io, socket);
    });

    return io;

}

module.exports = initSocket;