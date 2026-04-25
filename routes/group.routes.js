const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const groupController = require("../controllers/group.controller");

router.get("/", authMiddleware, groupController.listGroups);
router.post("/", authMiddleware, groupController.createGroup);
router.post("/join/:groupId", authMiddleware, groupController.joinGroup);
router.post("/accept-invite", authMiddleware, groupController.joinGroup);

module.exports = router;
