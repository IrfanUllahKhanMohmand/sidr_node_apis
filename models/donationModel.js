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
    const sql = `
      SELECT 
        d.id AS donationId,
        d.userId,
        d.charityPageId,
        d.amount,
        d.payment_method,
        d.createdAt,
        u.id AS userId,
        u.name AS userName,
        u.email AS userEmail,
        u.profile_image AS userProfileImage
      FROM donations d
      JOIN users u ON d.userId = u.id
      WHERE d.charityPageId = ?`;

    db.query(sql, [charityPageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        // Transforming result into desired structure
        const donations = result.map((row) => ({
          id: row.donationId,
          userId: row.userId,
          charityPageId: row.charityPageId,
          amount: row.amount,
          payment_method: row.payment_method,
          createdAt: row.createdAt,
          user: {
            id: row.userId,
            name: row.userName,
            email: row.userEmail,
            profile_image: row.userProfileImage,
          },
        }));
        callback(null, donations);
      }
    });
  },

  getDonationsByUserId: async (userId, callback) => {
    const sql = `
      SELECT 
        donations.*,
        charity_pages.id AS charity_id,
        charity_pages.name AS charity_name,
        charity_pages.location,
        charity_pages.profile_image,
        charity_pages.cover_image,
        charity_pages.front_image,
        charity_pages.back_image,
        charity_pages.description,
        charity_pages.status AS charity_status,
        charity_pages.createdAt AS charity_createdAt
      FROM donations
      LEFT JOIN charity_pages ON donations.charityPageId = charity_pages.id
      WHERE donations.userId = ?
    `;

    db.query(sql, [userId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        // Format the result to include charity data as a separate field
        const formattedResult = result.map((donation) => {
          const {
            charity_id,
            charity_name,
            location,
            profile_image,
            cover_image,
            front_image,
            back_image,
            description,
            charity_status,
            charity_createdAt,
            ...donationData
          } = donation;

          return {
            ...donationData,
            charityPage: {
              id: charity_id,
              name: charity_name,
              location,
              profile_image,
              cover_image,
              front_image,
              back_image,
              description,
              status: charity_status,
              createdAt: charity_createdAt,
            },
          };
        });

        callback(null, formattedResult);
      }
    });
  },
};

module.exports = Donation;
