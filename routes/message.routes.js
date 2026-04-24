const express = require("express");
const router = express.Router();

const messageController = require("../controllers/message.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/send", authMiddleware, messageController.sendMessage);
router.get("/all", authMiddleware, messageController.getMessages);
router.get("/:roomId", authMiddleware, messageController.getMessagesByRoom);
router.delete("/:roomId", authMiddleware, messageController.clearRoomMessages);

module.exports = router;