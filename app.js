require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const sequelize = require("./config/db");
const logger = require('./utils/logger');

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(express.static("view"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/view/login.html");
});

app.use("/api/auth", authRoutes);

process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

(async () => {

  try {

    await sequelize.sync({ alter: true });

    logger.info("✅ Database synced");

    app.listen(process.env.PORT, () => {
      logger.info(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (err) {

    logger.error("========================================>");
    logger.error(`ERROR WHILE SYNCING DB: ${err.stack || err.message}`);
    logger.error("========================================>");
    process.exit(1);

  }

})();