const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { verifyToken: authenticateToken } = require("../middleware/authJWT");

// All routes require authentication
router.use(authenticateToken);

router.get("/contacts", chatController.getContacts);
router.get("/history/:otherId", chatController.getHistory);
router.get("/status", chatController.getChatStatus);

router.post("/send", chatController.sendMessage);
router.post("/read/:senderId", chatController.markAsRead);

module.exports = router;
