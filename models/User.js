// File: models/User.js
const admin = require("firebase-admin");
const db = require("../config/db");

const User = {
  create: (id, name, email, phone, profileImage, callback) => {
    const query =
      "INSERT INTO users (id, name, email,phone, profile_image) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [id, name, email, phone, profileImage], callback);
  },

  update: (id, name, email, phone, profileImage, callback) => {
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
    if (phone !== null) {
      updates.push("phone = ?");
      values.push(phone);
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

  findById: (id, currentUserId, callback) => {
    let query = `
        SELECT u.*, 
               (SELECT COUNT(f.follower_id) FROM followers f WHERE f.following_id = u.id) AS followers_count,
               (SELECT COUNT(f.following_id) FROM followers f WHERE f.follower_id = u.id) AS followings_count`;

    // Add the isFollower check if currentUserId is provided
    if (currentUserId) {
      query += `,
               EXISTS (
                 SELECT 1 
                 FROM followers 
                 WHERE follower_id = ? AND following_id = u.id
               ) AS isFollower`;
    } else {
      query += `, 0 AS isFollower`; // Default to 0 (false) if no currentUserId
    }

    query += `
        FROM users u 
        WHERE u.id = ?`;

    // Build query parameters array
    const queryParams = currentUserId ? [currentUserId, id] : [id];

    db.query(query, queryParams, async (error, results) => {
      if (error) {
        return callback(error);
      }
      if (results.length > 0) {
        const user = results[0];
        const firebaseUser = await admin.auth().getUser(user.id);

        // Assign counts and isFollower directly
        user.followers_count = user.followers_count || 0; // Default to 0 if null
        user.followings_count = user.followings_count || 0; // Default to 0 if null
        user.isFollower = Boolean(user.isFollower); // Convert to boolean

        // Await the isUserDisabled function to get the disabled status
        user.isDisabled = firebaseUser.disabled;

        callback(null, user);
      } else {
        callback(null, null); // No user found
      }
    });
  },

  findAll: async ({ limit, offset, search, excludeId }, callback) => {
    try {
      // Define the query
      let query = `
        SELECT u.*, 
               (SELECT COUNT(f.follower_id) FROM followers f WHERE f.following_id = u.id) AS followers_count,
               (SELECT COUNT(f.following_id) FROM followers f WHERE f.follower_id = u.id) AS followings_count`;

      // Add the isFollower check using excludeId
      if (excludeId) {
        query += `,
               EXISTS (
                 SELECT 1 
                 FROM followers 
                 WHERE follower_id = ? AND following_id = u.id
               ) AS isFollower`;
      } else {
        query += `, 0 AS isFollower`; // Default to 0 (false) if no excludeId
      }

      query += `
        FROM users u`;

      const queryParams = [];
      let conditions = [];

      // Exclude specific user (current user) if excludeId is provided
      if (excludeId) {
        conditions.push("u.id != ?");
        queryParams.push(excludeId);
      }

      // Search users by name or email if search is provided
      if (search) {
        conditions.push("(u.name LIKE ? OR u.email LIKE ?)");
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      // Append WHERE conditions if any
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`;
      }

      // Add pagination
      query += " LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      // If excludeId is provided, add it to the front of the parameters (for isFollower check)
      if (excludeId) {
        queryParams.unshift(excludeId); // Ensure it's used for the follower check
      }

      // Use a Promise wrapper for db.query
      const runQuery = (query, queryParams) => {
        return new Promise((resolve, reject) => {
          db.query(query, queryParams, (error, results) => {
            if (error) {
              reject(error);
            } else {
              resolve(results);
            }
          });
        });
      };

      // Execute the query
      const results = await runQuery(query, queryParams);

      if (!Array.isArray(results)) {
        throw new Error("Invalid query results format.");
      }

      // Custom concurrency control
      const processWithConcurrency = async (items, concurrency, processor) => {
        const queue = [...items];
        const activeTasks = [];

        const runNext = async () => {
          if (queue.length === 0) return null; // Exit if the queue is empty

          const item = queue.shift(); // Get the next item
          const task = processor(item).catch((error) => {
            console.error("Error in processor:", error);
          });

          activeTasks.push(task);

          // Wait for the task to finish, then remove it from active tasks
          task.finally(() => {
            const index = activeTasks.indexOf(task);
            if (index >= 0) activeTasks.splice(index, 1);
          });

          if (activeTasks.length < concurrency && queue.length > 0) {
            runNext(); // Start the next task if concurrency allows
          }

          return task;
        };

        // Start initial tasks up to the concurrency limit
        await Promise.all(Array(concurrency).fill(null).map(runNext));

        // Wait for all tasks to complete
        await Promise.all(activeTasks);
      };

      // Processor function for each user
      const processUser = async (user) => {
        try {
          const firebaseUser = await admin.auth().getUser(user.id);
          user.isDisabled = firebaseUser.disabled;
        } catch (error) {
          user.isDisabled = false; // Handle user not found or other errors gracefully
          console.error(`Error fetching user ${user.id}:`, error);
        }
        user.followers_count = user.followers_count || 0;
        user.followings_count = user.followings_count || 0;
        user.isFollower = Boolean(user.isFollower); // Convert to boolean
        return user;
      };

      // Process users with concurrency control
      const usersWithFollowersAndFollowingsCount = [];
      await processWithConcurrency(results, 5, async (user) => {
        const processedUser = await processUser(user);
        usersWithFollowersAndFollowingsCount.push(processedUser);
      });

      // Return processed users via the callback
      callback(null, usersWithFollowersAndFollowingsCount);
    } catch (error) {
      // Handle any errors
      callback(error);
    }
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
