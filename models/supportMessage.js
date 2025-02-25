const db = require("../config/db")

exports.create = (message, callback) => {
    const sql = `
    INSERT INTO support_messages 
    (id, sender_id, receiver_id, receiver_type, message, type, media_url) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `

    db.query(
        sql,
        [
            message.id,
            message.sender_id,
            message.receiver_id,
            message.receiver_type,
            message.message,
            message.type,
            message.media_url,
        ],
        callback,
    )
}


//fetch support conversations with last message and the user details
exports.getConversations = (user_id, callback) => {
    const sql = `
    SELECT 
      sm.id, 
      sm.sender_id, 
      sm.receiver_id, 
      sm.receiver_type, 
      sm.message, 
      sm.type, 
      sm.media_url, 
      sm.timestamp, 
      u.name, 
      u.email, 
      u.phone, 
      u.profile_image 
    FROM 
      support_messages sm 
      JOIN users u ON 
        CASE 
          WHEN sm.sender_id = ? THEN sm.receiver_id = u.id 
          WHEN sm.receiver_id = ? THEN sm.sender_id = u.id 
        END 
    WHERE 
      sm.timestamp IN (
        SELECT 
          MAX(timestamp) 
        FROM 
          support_messages 
        WHERE 
          sender_id = ? OR receiver_id = ? 
        GROUP BY 
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END
      )
    ORDER BY sm.timestamp DESC
  `;

    db.query(sql, [user_id, user_id, user_id, user_id, user_id], callback);
}

exports.getMessagesWithUser = (user_id, other_user_id, callback) => {
    const sql = `
    SELECT 
      sm.id, 
      sm.sender_id, 
      sm.receiver_id, 
      sm.receiver_type, 
      sm.message, 
      sm.type, 
      sm.media_url, 
      sm.timestamp 
    FROM 
      support_messages sm 
    WHERE 
      (sm.sender_id = ? AND sm.receiver_id = ?) 
      OR 
      (sm.sender_id = ? AND sm.receiver_id = ?)
    ORDER BY 
      sm.timestamp ASC
  `;

    db.query(sql, [user_id, other_user_id, other_user_id, user_id], callback);
};




exports.findAll = (callback) => {
    const sql = `SELECT * FROM support_messages`

    db.query(sql, callback)
}

exports.findById = (id, callback) => {
    const sql = `SELECT * FROM support_messages WHERE id = ?`

    db.query(sql, [id], callback)
}

exports.update = (id, message, callback) => {
    const sql = `
    UPDATE support_messages 
    SET sender_id = ?, receiver_id = ?, receiver_type = ?, message = ?, type = ?, media_url = ? 
    WHERE id = ?
  `

    db.query(
        sql,
        [
            message.sender_id,
            message.receiver_id,
            message.receiver_type,
            message.message,
            message.type,
            message.media_url,
            id,
        ],
        callback,
    )
}

exports.delete = (id, callback) => {
    const sql = `DELETE FROM support_messages WHERE id = ?`

    db.query(sql, [id], callback)
}

