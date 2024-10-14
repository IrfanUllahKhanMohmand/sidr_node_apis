// /models/donationModel.js
const db = require("../config/db");

const Donation = {
  create: async (donationData, callback) => {
    const { id, userId, charityPageId, amount, payment_method } = donationData;
    const sql = `INSERT INTO donations (id,userId, charityPageId, amount, payment_method)
                     VALUES (?,?, ?, ?, ?)`;
    db.query(
      sql,
      [id, userId, charityPageId, amount, payment_method],
      (err, result) => {
        if (err) {
          callback(err, null);
        } else {
          callback(null, { id, userId, charityPageId, amount, payment_method });
        }
      }
    );
  },
  getAll: async (callback) => {
    const sql = `SELECT * FROM donations`;
    db.query(sql, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },

  getDonationById: async (donationId, callback) => {
    const sql = `SELECT * FROM donations WHERE id = ?`;
    db.query(sql, [donationId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },

  getDonationsByCharityPageId: async (charityPageId, callback) => {
    const sql = `SELECT * FROM donations WHERE charityPageId = ?`;
    db.query(sql, [charityPageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },

  getDonationsByUserId: async (userId, callback) => {
    const sql = `SELECT * FROM donations WHERE userId = ?`;
    db.query(sql, [userId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },
};

module.exports = Donation;
