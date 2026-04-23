require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/db");
const logger = require('./utils/logger');
const http = require("http");
const WebSocket = require("ws");

const Message = require("./models/message.model"); // ✅ FIX
const messageRoutes = require("./routes/message.routes");
const authRoutes = require("./routes/auth.routes");

const app = express();

// ✅ Create server properly
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clients = [];

// ✅ WebSocket Logic
wss.on("connection", (ws) => {

  console.log("🔌 New client connected");
  clients.push(ws);

  ws.on("close", () => {
    clients = clients.filter(client => client !== ws);
    console.log("❌ Client disconnected");
  });

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data);
      const { message, userId } = parsed;

      // Save to DB
      const savedMessage = await Message.create({ message, userId });

      const payload = JSON.stringify({
        id: savedMessage.id,
        message: savedMessage.message,
        userId: savedMessage.userId,
        createdAt: savedMessage.createdAt
      });

      // Broadcast to all clients
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });

    } catch (err) {
      console.log("WS Error:", err);
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

    // ✅ IMPORTANT: use server.listen (not app.listen)
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