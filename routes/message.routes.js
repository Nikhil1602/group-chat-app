const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/all", authMiddleware, messageController.getMessages);

module.exports = router;