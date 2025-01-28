// models/messageModel.js

const db = require("../config/db");

// Insert a new message into the database
const createMessage = (messageData, callback) => {
  const {
    id,
    sender_id,
    receiver_id,
    message,
    type,
    receiver_type,
    media_url,
  } = messageData;
  const sql =
    "INSERT INTO messages (id, sender_id, receiver_id, message, type,receiver_type, media_url) VALUES (?,?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [id, sender_id, receiver_id, message, type, receiver_type, media_url],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

// Fetch messages between two users
const getMessages = (user1_id, user2_id, callback) => {
  const sql = `
    SELECT 
      m.*,
      CASE 
        WHEN m.sender_id = ? THEN 1 
        ELSE 0 
      END AS isSender
    FROM messages m
    LEFT JOIN charity_pages cp ON m.receiver_id = cp.id
    WHERE 
      (
        (m.sender_id = ? AND m.receiver_id = ?) -- User-to-user messages
        OR 
        (m.sender_id = ? AND m.receiver_id = ?) -- Reverse user-to-user messages
        OR 
        (cp.id IS NOT NULL AND m.receiver_id = ?) -- Messages involving a charity page
      )
    ORDER BY m.timestamp DESC
  `;

  const params = [user1_id, user1_id, user2_id, user2_id, user1_id, user2_id];

  db.query(sql, params, (err, results) => {
    if (err) return callback(err);
    results = results.map((result) => ({
      ...result,
      isSender: result.isSender === 1,
    }));
    callback(null, results);
  });
};

// Fetch unique conversations for a user
const getConversations = (user_id, callback) => {
  const sql = `
    WITH last_messages AS (
      SELECT 
          conversation_with,
          type,
          MAX(timestamp) AS last_message_time
      FROM (
          SELECT 
              IF(sender_id = ?, receiver_id, sender_id) AS conversation_with,
              receiver_type AS type,
              timestamp
          FROM messages
          WHERE (sender_id = ? OR receiver_id = ?)
            AND (
                (receiver_type = 'user' AND (sender_id = ? OR receiver_id = ?))
                OR 
                (receiver_type = 'charity_page' AND receiver_id IN (
                    SELECT charity_page_id 
                    FROM follows 
                    WHERE user_id = ?
                ))
            )
      ) AS subquery
      GROUP BY conversation_with, type

      UNION ALL

      -- Include charity pages with no messages
      SELECT 
          f.charity_page_id AS conversation_with,
          'charity_page' AS type,
          NULL AS last_message_time
      FROM follows AS f
      WHERE f.user_id = ?
        AND f.charity_page_id NOT IN (
            SELECT 
                IF(sender_id = ?, receiver_id, sender_id)
            FROM messages
            WHERE 
                (sender_id = ? OR receiver_id = ?)
                AND receiver_type = 'charity_page'
        )
    )

    SELECT 
        lm.conversation_with AS id,
        lm.type AS receiver_type,
        CASE 
            WHEN lm.type = 'user' THEN u.name
            WHEN lm.type = 'charity_page' THEN cp.name
        END AS name,
        CASE 
            WHEN lm.type = 'user' THEN u.profile_image
            WHEN lm.type = 'charity_page' THEN cp.profile_image
        END AS profile_image,
        COALESCE(
            (SELECT 
                 CASE 
                     WHEN m.type IN ('image', 'video') THEN m.type
                     ELSE m.message
                 END 
             FROM messages m 
             WHERE m.timestamp = lm.last_message_time 
               AND ((m.sender_id = lm.conversation_with AND m.receiver_id = ?) 
                    OR (m.receiver_id = lm.conversation_with AND m.sender_id = ?))),
            'No messages'
        ) AS last_message,
        lm.last_message_time AS message_time
    FROM last_messages lm
    LEFT JOIN users u ON lm.conversation_with = u.id AND lm.type = 'user'
    LEFT JOIN charity_pages cp ON lm.conversation_with = cp.id AND lm.type = 'charity_page'
    ORDER BY lm.last_message_time DESC;
  `;

  db.query(
    sql,
    [
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
      user_id,
    ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
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
