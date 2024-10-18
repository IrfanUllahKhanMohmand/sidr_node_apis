// File: models/User.js

const e = require("express");
const db = require("../config/db");

const User = {
  create: (id, name, email, profileImage, callback) => {
    const query =
      "INSERT INTO users (id, name, email, profile_image) VALUES (?, ?, ?, ?)";
    db.query(query, [id, name, email, profileImage], callback);
  },

  update: (id, name, email, profileImage, callback) => {
    const updates = [];
    const values = [];

    if (name !== null) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email !== null) {
      updates.push("email = ?");
      values.push(email);
    }
    if (profileImage !== null) {
      updates.push("profile_image = ?");
      values.push(profileImage);
    }

    // If no fields are provided, do not perform an update
    if (updates.length === 0) {
      return callback(null, { message: "No fields to update." });
    }

    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);

    db.query(query, values, callback);
  },

  delete: (id, callback) => {
    const query = "DELETE FROM users WHERE id = ?";
    db.query(query, [id], callback);
  },

  doesUserExist: (id, callback) => {
    const query = "SELECT COUNT(*) AS user_exists FROM users WHERE id = ?";
    db.query(query, [id], (error, results) => {
      if (error) {
        return callback(error);
      }
      callback(null, results[0].user_exists > 0);
    });
  },

  findById: (id, callback) => {
    const query = `
        SELECT u.*, 
               (SELECT COUNT(f.follower_id) FROM followers f WHERE f.following_id = ?) AS followers_count,
               (SELECT COUNT(f.following_id) FROM followers f WHERE f.follower_id = ?) AS followings_count
        FROM users u 
        WHERE u.id = ?`;

    db.query(query, [id, id, id], (error, results) => {
      if (error) {
        return callback(error);
      }
      if (results.length > 0) {
        const user = results[0];
        // Assign counts directly
        user.followers_count = user.followers_count || 0; // Default to 0 if null
        user.followings_count = user.followings_count || 0; // Default to 0 if null
        callback(null, user);
      } else {
        callback(null, null); // No user found
      }
    });
  },

  // Extend findAll to handle exclusion and search parameters
  findAll: ({ limit, offset, search, excludeId }, callback) => {
    let query = `
    SELECT u.*, 
           (SELECT COUNT(f.follower_id) FROM followers f WHERE f.following_id = u.id) AS followers_count,
           (SELECT COUNT(f.following_id) FROM followers f WHERE f.follower_id = u.id) AS followings_count
    FROM users u`;

    const queryParams = [];
    let conditions = [];

    if (excludeId) {
      conditions.push("u.id != ?");
      queryParams.push(excludeId); // Push excludeId first
    }
    if (search) {
      conditions.push("(u.name LIKE ? OR u.email LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`); // Then add search terms
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += " LIMIT ? OFFSET ?"; // Add pagination

    queryParams.push(limit, offset); // Finally add limit and offset

    // Execute query with the correctly ordered parameters
    db.query(query, queryParams, (error, results) => {
      if (error) {
        return callback(error);
      }

      const usersWithFollowersAndFollowingsCount = results.map((user) => {
        user.followers_count = user.followers_count || 0;
        user.followings_count = user.followings_count || 0;
        return user;
      });

      callback(null, usersWithFollowersAndFollowingsCount);
    });
  },

  addFollowing: (userId, followingId, callback) => {
    // First, check if the user is already following
    const checkQuery = `SELECT COUNT(*) AS following_exists FROM followers WHERE follower_id = ? AND following_id = ?`;

    db.query(checkQuery, [userId, followingId], (checkErr, checkResult) => {
      if (checkErr) {
        return callback(checkErr);
      }

      // If not already following, add to followings
      if (checkResult[0].following_exists === 0) {
        const addQuery = `INSERT INTO followers (follower_id, following_id) VALUES (?, ?)`;
        db.query(addQuery, [userId, followingId], callback);
      } else {
        // Already following
        callback(null, { message: "Already following this user" });
      }
    });
  },

  removeFollowing: (userId, followingId, callback) => {
    const checkQuery = `SELECT COUNT(*) AS following_exists FROM followers WHERE follower_id = ? AND following_id = ?`;

    db.query(checkQuery, [userId, followingId], (checkErr, checkResult) => {
      if (checkErr) {
        return callback(checkErr);
      }

      // If the user is following, remove them
      if (checkResult[0].following_exists === 1) {
        const removeQuery = `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`;
        db.query(removeQuery, [userId, followingId], callback);
      } else {
        // User is not following
        callback(null, { message: "User is not following this user" });
      }
    });
  },

  getFollowers: (userId, callback) => {
    const query = `
        SELECT u.* 
        FROM followers f
        JOIN users u ON f.follower_id = u.id
        WHERE f.following_id = ?`;
    db.query(query, [userId], callback);
  },

  getFollowings: (userId, callback) => {
    const query = `
      SELECT u.* 
      FROM followers f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?`;
    db.query(query, [userId], callback);
  },
};

module.exports = User;
