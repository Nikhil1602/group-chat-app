require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/db");
const logger = require('./utils/logger');
const http = require("http");
const { Server } = require("socket.io"); // ✅ Socket.IO

const Message = require("./models/message.model");
const messageRoutes = require("./routes/message.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// Create server
const server = http.createServer(app);

// ✅ Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// ✅ Socket.IO Logic
io.on("connection", (socket) => {

  console.log("🔌 User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });

  socket.on("chat-message", async (data) => {
    try {
      const { message, userId } = data;

      // Save to DB
      const savedMessage = await Message.create({ message, userId });

      // Broadcast to all clients
      io.emit("chat-message", {
        id: savedMessage.id,
        message: savedMessage.message,
        userId: savedMessage.userId,
        createdAt: savedMessage.createdAt
      });

    } catch (err) {
      console.log("Socket.IO Error:", err);
    }
  });
});

// Middleware
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.static("view"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/view/login.html");
});

app.use("/api/message", messageRoutes);
app.use("/api/auth", authRoutes);

// Error handlers
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

// Start server
(async () => {
  try {
    await sequelize.sync({ alter: true });
    logger.info("✅ Database synced");

    server.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (err) {
    logger.error("========================================>");
    logger.error(`ERROR WHILE SYNCING DB: ${err.stack || err.message}`);
    logger.error("========================================>");
    process.exit(1);
  }
})();