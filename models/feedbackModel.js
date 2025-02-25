const db = require("../config/db");
const crypto = require("crypto");


//Create feedback table
exports.createFeedbackTable = () => {
    const sql = `CREATE TABLE IF NOT EXISTS feedback (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)`;
    db.query(sql, (err, result) => {
        if (err) throw err;

    });
};


// Insert a new feedback into the database
exports.createFeedback = (feedbackData, callback) => {
    const { user_id, content } = feedbackData;
    const id = crypto.randomBytes(16).toString("hex");
    const sql = "INSERT INTO feedback (id, user_id, content) VALUES (?,?, ?)";
    db.query(sql, [
        id, user_id, content
    ], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
}

// Fetch feedbacks for a user
exports.getUserFeedbacks = (user_id, callback) => {
    const sql = `SELECT * FROM feedback WHERE user_id = ?`;
    db.query(sql, [user_id], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Fetch all feedbacks
exports.getAllFeedbacks = (callback) => {
    const sql = `SELECT * FROM feedback`;
    db.query(sql, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Delete feedback
exports.deleteFeedback = (feedbackId, callback) => {
    const sql = `DELETE FROM feedback WHERE id = ?`;
    db.query(sql, [feedbackId], (err, result) => {
        if (err) return callback(err);
        if (result.affectedRows === 0)
            return callback({ error: "Feedback not found" });
        callback(null, { message: "Feedback deleted successfully" });
    }
    );
}


//search feedbacks part are full of content matching the search query
exports.searchFeedbacks = (search, callback) => {
    const sql = `SELECT * FROM feedback WHERE content LIKE ?`;
    db.query(sql, [`%${search}%`], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}


