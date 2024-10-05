// File: models/User.js

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

  findAll: (callback) => {
    const query = `
        SELECT u.*, 
               (SELECT COUNT(f.follower_id) FROM followers f WHERE f.following_id = u.id) AS followers_count,
               (SELECT COUNT(f.following_id) FROM followers f WHERE f.follower_id = u.id) AS followings_count
        FROM users u`;

    db.query(query, (error, results) => {
      if (error) {
        return callback(error);
      }

      // Process each user result to include counts of followers and followings
      const usersWithFollowersAndFollowingsCount = results.map((user) => {
        user.followers_count = user.followers_count || 0; // Default to 0 if null
        user.followings_count = user.followings_count || 0; // Default to 0 if null
        return user;
      });

      callback(null, usersWithFollowersAndFollowingsCount);
    });
  },
  addFollower: (userId, followerId, callback) => {
    // First, check if the follower already exists
    const checkQuery = `SELECT COUNT(*) AS follower_exists FROM followers WHERE following_id = ? AND follower_id = ?`;

    db.query(checkQuery, [userId, followerId], (checkErr, checkResult) => {
      if (checkErr) {
        return callback(checkErr);
      }

      // If the follower doesn't exist, add them
      if (checkResult[0].follower_exists === 0) {
        const addQuery = `INSERT INTO followers (follower_id, following_id) VALUES (?, ?)`;
        db.query(addQuery, [followerId, userId], callback);
      } else {
        // Follower already exists
        callback(null, { message: "Follower already exists" });
      }
    });
  },

  removeFollower: (userId, followerId, callback) => {
    const query = `DELETE FROM followers WHERE following_id = ? AND follower_id = ?`;
    db.query(query, [userId, followerId], callback);
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
    const query = `DELETE FROM followers WHERE follower_id = ? AND following_id = ?`;
    db.query(query, [userId, followingId], callback);
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
