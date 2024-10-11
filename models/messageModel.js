// models/messageModel.js

const db = require("../config/db");

// Insert a new message into the database
const createMessage = (messageData, callback) => {
  const { id, sender_id, receiver_id, message, type, media_url } = messageData;
  const sql =
    "INSERT INTO messages (id, sender_id, receiver_id, message, type, media_url) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [id, sender_id, receiver_id, message, type, media_url],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

// Fetch messages between two users
const getMessages = (user1_id, user2_id, callback) => {
  const sql = `
        SELECT * FROM messages 
        WHERE (sender_id = ? AND receiver_id = ?) 
           OR (sender_id = ? AND receiver_id = ?)
        ORDER BY timestamp DESC
    `;
  db.query(sql, [user1_id, user2_id, user2_id, user1_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Fetch unique conversations for a user
const getConversations = (user_id, callback) => {
  const sql = `
      SELECT 
        u.id AS user_id,
        u.name,
        u.profile_image,
        m.message AS last_message,
        m.timestamp AS message_time
      FROM (
        SELECT 
          IF(sender_id = ?, receiver_id, sender_id) AS conversation_with,
          MAX(id) AS last_message_id
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY conversation_with
      ) AS conv
      JOIN messages AS m ON m.id = conv.last_message_id
      JOIN users AS u ON u.id = conv.conversation_with
      ORDER BY m.timestamp DESC
    `;

  db.query(sql, [user_id, user_id, user_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Delete a specific message by its ID
const deleteMessage = (message_id, callback) => {
  const sql = "DELETE FROM messages WHERE id = ?";
  db.query(sql, [message_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Delete all messages between two users
const deleteAllMessages = (user1_id, user2_id, callback) => {
  const sql = `
          DELETE FROM messages 
          WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?)
      `;
  db.query(sql, [user1_id, user2_id, user2_id, user1_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

module.exports = {
  createMessage,
  getMessages,
  getConversations,
  deleteMessage,
  deleteAllMessages,
};
