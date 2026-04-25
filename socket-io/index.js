const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const personalChatHandler = require("./handlers/personalChat");
const User = require("../models/user.model");

module.exports = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "*", // match your frontend
            credentials: true
        }
    });

    console.log("🚀 Socket.IO server initialized");

    // ✅ AUTH MIDDLEWARE
    io.use((socket, next) => {

        try {

            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error("No token"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;

            next();

        } catch (err) {

            console.log("Auth error:", err);
            next(new Error("Invalid token"));

        }

    });

    // ✅ CONNECTION
    io.on("connection", (socket) => {

        console.log("🔌 Connected:", socket.user.id);
        socket.join(`user_${socket.user.id}`);

        User.findByPk(socket.user.id, { attributes: ["id", "groupId"] })
            .then((user) => {
                if (user?.groupId) {
                    socket.join(`group_${user.groupId}`);
                }
            })
            .catch((err) => console.log("Failed to auto-join group room:", err.message));

        // attach handlers
        personalChatHandler(io, socket);

        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.user.id);
        });

    });

};