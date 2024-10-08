const db = require("../config/db");
const crypto = require("crypto");

const CharityPage = {
  createPage: (pageData, callback) => {
    const id = crypto.randomBytes(16).toString("hex");
    const query = `
            INSERT INTO charity_pages (id, name, location, front_image, back_image, description, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    const values = [
      id,
      pageData.name,
      pageData.location,
      pageData.front_image,
      pageData.back_image,
      pageData.description,
      pageData.userId,
    ];
    db.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id, ...pageData });
      }
    });
  },

  updatePage: (pageId, pageData, callback) => {
    const updates = [];
    const values = [];

    if (pageData.name) {
      updates.push("name = ?");
      values.push(pageData.name);
    }
    if (pageData.location) {
      updates.push("location = ?");
      values.push(pageData.location);
    }
    if (pageData.description) {
      updates.push("description = ?");
      values.push(pageData.description);
    }

    if (pageData.front_image) {
      updates.push("front_image = ?");
      values.push(pageData.front_image);
    }

    if (pageData.back_image) {
      updates.push("back_image = ?");
      values.push(pageData.back_image);
    }

    if (updates.length === 0) {
      return callback(null, { message: "No fields to update." });
    }

    const query = `UPDATE charity_pages SET ${updates.join(", ")} WHERE id = ?`;
    values.push(pageId);

    db.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: pageId, ...pageData });
      }
    });
  },

  deletePage: (pageId, callback) => {
    const query = "DELETE FROM charity_pages WHERE id = ?";
    db.query(query, [pageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { message: "Charity page deleted successfully" });
      }
    });
  },

  getPageById: (pageId, callback) => {
    const query = "SELECT * FROM charity_pages WHERE id = ?";
    db.query(query, [pageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result[0]);
      }
    });
  },

  getPagesByUserId: (userId, callback) => {
    const query = "SELECT * FROM charity_pages WHERE userId = ?";
    db.query(query, [userId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },

  getPages: (callback) => {
    const query = "SELECT * FROM charity_pages";
    db.query(query, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result);
      }
    });
  },
};

module.exports = CharityPage;
