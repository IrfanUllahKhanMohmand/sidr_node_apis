// models/Report.js
const db = require("../config/db");

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
    let query = `
        SELECT reports.*, users.id AS user_id, users.name AS user_name, users.email AS user_email, 
               users.profile_image AS user_profile_image, posts.id AS post_id, posts.userId AS post_userId, 
               posts.image_path AS post_image_path, posts.title AS post_title, posts.content AS post_content, 
               posts.createdAt AS post_createdAt
        FROM reports
        LEFT JOIN users ON reports.userId = users.id
        LEFT JOIN posts ON reports.postId = posts.id
        WHERE reports.postId = ?
    `;

    const queryParams = [postId];

    if (reportStatus) {
      query += ` AND reports.status = ?`;
      queryParams.push(reportStatus);
    }

    db.query(query, queryParams, callback);
  },

  findByUserId: ({ userId, reportStatus }, callback) => {
    let query = `
        SELECT reports.*, users.id AS user_id, users.name AS user_name, users.email AS user_email, 
               users.profile_image AS user_profile_image, posts.id AS post_id, posts.userId AS post_userId, 
               posts.image_path AS post_image_path, posts.title AS post_title, posts.content AS post_content, 
               posts.createdAt AS post_createdAt
        FROM reports
        LEFT JOIN users ON reports.userId = users.id
        LEFT JOIN posts ON reports.postId = posts.id
        WHERE reports.userId = ?
    `;

    const queryParams = [userId];

    if (reportStatus) {
      query += ` AND reports.status = ?`;
      queryParams.push(reportStatus);
    }

    db.query(query, queryParams, callback);
  },

  findAll: ({ reportStatus }, callback) => {
    let query = `
        SELECT reports.*,users.id AS user_id, users.name AS user_name, users.email AS user_email, users.profile_image AS user_profile_image, 
              posts.id AS post_id, posts.userId AS post_userId, posts.image_path AS post_image_path, posts.title AS post_title, posts.content AS post_content,posts.createdAt AS post_createdAt
        FROM reports
        LEFT JOIN users ON reports.userId = users.id
        LEFT JOIN posts ON reports.postId = posts.id
    `;

    if (reportStatus) {
      query += ` WHERE reports.status = ?`;
      db.query(query, [reportStatus], callback);
    } else {
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
