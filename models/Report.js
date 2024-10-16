// models/Report.js
const db = require("../config/db");
const { findAll } = require("./User");

const Report = {
  create: (report, callback) => {
    const query = `INSERT INTO reports (id, reporting_user_id, postId, userId, reason) VALUES (?, ?, ?, ?, ?)`;
    db.query(
      query,
      [
        report.id,
        report.reportingUserId,
        report.postId,
        report.userId,
        report.reason,
      ],
      callback
    );
  },
  findByPostId: ({ postId, reportStatus }, callback) => {
    if (reportStatus) {
      const query = `SELECT * FROM reports WHERE postId = ? AND status = ?`;
      db.query(query, [postId, reportStatus], callback);
    } else {
      const query = `SELECT * FROM reports WHERE postId = ?`;
      db.query(query, [postId], callback);
    }
  },
  findByUserId: ({ userId, reportStatus }, callback) => {
    if (reportStatus) {
      const query = `SELECT * FROM reports WHERE userId = ? AND status = ?`;
      db.query(query, [userId, reportStatus], callback);
    } else {
      const query = `SELECT * FROM reports WHERE userId = ?`;
      db.query(query, [userId], callback);
    }
  },
  findAll: ({ reportStatus }, callback) => {
    if (reportStatus) {
      const query = `SELECT * FROM reports WHERE status = ?`;
      db.query(query, [reportStatus], callback);
    } else {
      const query = `SELECT * FROM reports`;
      db.query(query, callback);
    }
  },

  markAsResolved: (reportId, callback) => {
    const query = `UPDATE reports SET status = 'resolved' WHERE id = ?`;
    db.query(query, [reportId], callback);
  },

  delete: (reportId, callback) => {
    const query = `DELETE FROM reports WHERE id = ?`;
    db.query(query, [reportId], callback);
  },
};

module.exports = Report;
