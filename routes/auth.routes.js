const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/user", authController.getUserByEmail);
router.get("/me", authMiddleware, authController.getMe);
router.post("/logout", authController.logout);
router.get("/ungrouped", authMiddleware, authController.getUngroupedUsers);

module.exports = router;