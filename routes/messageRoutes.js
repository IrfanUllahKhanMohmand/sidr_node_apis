const express = require("express");

const router = express.Router();
const { upload } = require("../common/imageUploader");

const { verifyToken } = require("../common/verifyToken");
const {
  sendMessage,
  getMessages,
  getConversations,
  deleteMessage,
  deleteAllMessages,
  getAllMessages,
  getAllConversations
} = require("../controllers/messageController");

// Route to send a message
router.post("/messages", upload.single("media"), verifyToken, sendMessage);


// Route to get all messages from database
router.get("/messages", verifyToken, getAllMessages);

// Route to get messages between two users
router.get("/messages/:id", verifyToken, getMessages);

// Route to get unique conversations for a user
router.get("/conversations", verifyToken, getConversations);

// Route to get all the conversations as an admin
router.get("/conversations/all", verifyToken, getAllConversations);

// Route to delete a message
router.delete("/messages/:id", verifyToken, deleteMessage);

// Route to delete all messages between two users
router.delete("/messages/all/:id", verifyToken, deleteAllMessages);

module.exports = router;
