require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/db");
const logger = require('./utils/logger');
const http = require("http");

// Routes
const messageRoutes = require("./routes/message.routes");
const authRoutes = require("./routes/auth.routes");

// Socket initializer
const initSocket = require("./socket-io");

const app = express();
const server = http.createServer(app);


// --------------------
// Middleware
// --------------------
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.static("view"));


// --------------------
// Routes
// --------------------
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/view/login.html");
});

app.use("/api/message", messageRoutes);
app.use("/api/auth", authRoutes);


// --------------------
// Socket Initialization
// --------------------
initSocket(server);


// --------------------
// Global Error Handlers
// --------------------
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});


// --------------------
// Start Server
// --------------------
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