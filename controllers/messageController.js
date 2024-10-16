// controllers/messageController.js

const crypto = require("crypto");
const messageModel = require("../models/messageModel");

// Controller to handle sending a message (text, image, video, or voice)
const sendMessage = (req, res) => {
  const { receiver_id, message, type } = req.body;
  const sender_id = req.currentUid;
  const media_url = req.file ? req.file.location : null;
  const id = crypto.randomBytes(16).toString("hex");

  const messageData = { id, sender_id, receiver_id, message, type, media_url };

  messageModel.createMessage(messageData, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      messageData,
    });
  });
};

// Controller to fetch messages between two users
const getMessages = (req, res) => {
  const user1_id = req.currentUid;
  const user2_id = req.params.id;

  messageModel.getMessages(user1_id, user2_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ messages: results });
  });
};

// Controller to get unique conversations for a user
const getConversations = (req, res) => {
  const user_id = req.currentUid;
  messageModel.getConversations(user_id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ conversations: results });
  });
};

const deleteMessage = (req, res) => {
  const messageId = req.params.id;

  messageModel.deleteMessage(messageId, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Message not found" });

    res.json({ message: "Message deleted successfully" });
  });
};

const deleteAllMessages = (req, res) => {
  const user1_id = req.currentUid;
  const user2_id = req.params.id;

  messageModel.deleteAllMessages(user1_id, user2_id, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Messages not found" });

    res.json({ message: "All messages deleted successfully" });
  });
};

module.exports = {
  sendMessage,
  getMessages,
  getConversations,
  deleteMessage,
  deleteAllMessages,
};
