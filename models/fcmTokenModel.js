// models/fcmToken.js
const db = require("../config/db");

// Insert or update FCM token
exports.saveToken = (userId, deviceId, token, callback) => {
  const sql = `
        INSERT INTO fcm_tokens (user_id, device_id, token)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE token = VALUES(token), updated_at = CURRENT_TIMESTAMP
    `;

  db.query(sql, [userId, deviceId, token], callback);
};

// Get all tokens for a user
exports.getTokensByUserId = (userId, callback) => {
  const sql = `SELECT token FROM fcm_tokens WHERE user_id = ?`;

  db.query(sql, [userId], callback);
};

//Get all tokens
exports.getAllTokens = (callback) => {
  const sql = `SELECT token FROM fcm_tokens`;

  db.query(sql, callback);
};

//Get all tokens with details
exports.getAllTokensWithDetails = (callback) => {
  const sql = `SELECT * FROM fcm_tokens`;

  db.query(sql, callback);
};

// Delete token on logout
exports.deleteToken = (userId, deviceId, callback) => {
  const sql = `DELETE FROM fcm_tokens WHERE user_id = ? AND device_id = ?`;

  db.query(sql, [userId, deviceId], callback);
};
