// File: models/Post.js

const db = require("../config/db");

const Post = {
  create: (id, title, content, userId, imagePath, callback) => {
    const query =
      "INSERT INTO posts (id, title, content, userId, image_path) VALUES (?,?, ?, ?, ?)";
    db.query(query, [id, title, content, userId, imagePath], callback);
  },

  update: (id, title, content, imagePath, callback) => {
    const updates = [];
    const values = [];

    if (title !== null) {
      updates.push("title = ?");
      values.push(title);
    }
    if (content !== null) {
      updates.push("content = ?");
      values.push(content);
    }
    if (imagePath !== null) {
      updates.push("image_path = ?");
      values.push(imagePath);
    }

    // If no fields are provided, do not perform an update
    if (updates.length === 0) {
      return callback(null, { message: "No fields to update." });
    }

    const query = `UPDATE posts SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);

    db.query(query, values, callback);
  },

  delete: (id, callback) => {
    const query = "DELETE FROM posts WHERE id = ?";
    db.query(query, [id], callback);
  },

  // findByUserId function with pagination support
  findByUserId: (userId, currentUserId, { limit, offset }, callback) => {
    const query = `
      SELECT p.*, 
             u.name, 
             u.profile_image, 
             COUNT(DISTINCT l.id) AS likes, 
             COUNT(DISTINCT c.id) AS commentCount,
             EXISTS (
               SELECT 1 
               FROM followers 
               WHERE follower_id = ? AND following_id = u.id
             ) AS isFollower
      FROM posts p 
      LEFT JOIN likes l ON p.id = l.postId 
      LEFT JOIN comments c ON p.id = c.postId 
      LEFT JOIN users u ON p.userId = u.id 
      WHERE p.userId = ? 
      GROUP BY p.id, u.id, u.name, u.profile_image
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?`;

    // Execute the query with currentUserId, userId, limit, and offset
    db.query(query, [currentUserId, userId, limit, offset], (err, results) => {
      if (err) {
        return callback(err);
      }

      // Format results to include user info and isFollower field
      const formattedResults = results.map((post) => ({
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          image_path: post.image_path,
          createdAt: post.createdAt,
          likes: post.likes,
          commentCount: post.commentCount,
        },
        user: {
          id: post.userId,
          name: post.name,
          profile_image: post.profile_image,
          isFollower: Boolean(post.isFollower),
        },
      }));

      callback(null, formattedResults); // Return posts with user info including isFollower field
    });
  },

  findById: (id, callback) => {
    const postQuery = `
      SELECT p.*, 
             u.name AS userName, 
             u.profile_image AS userProfileImage, 
             COUNT(DISTINCT l.id) AS likes 
      FROM posts p 
      LEFT JOIN likes l ON p.id = l.postId 
      LEFT JOIN users u ON p.userId = u.id
      WHERE p.id = ?
      GROUP BY p.id, u.id, u.name, u.profile_image
    `;

    const commentsQuery = `
      SELECT id, content, createdAt, userId
      FROM comments
      WHERE postId = ?
    `;

    db.query(postQuery, [id], (error, postResults) => {
      if (error) {
        return callback(error, null);
      }

      if (postResults.length === 0) {
        return callback(null, []);
      }

      const post = postResults[0];

      db.query(commentsQuery, [id], (error, commentResults) => {
        if (error) {
          return callback(error, null);
        }

        // Structure the final output
        const formattedPost = {
          post: {
            id: post.id,
            title: post.title,
            content: post.content,
            image_path: post.image_path,
            createdAt: post.createdAt,
            likes: post.likes,
            comments: commentResults, // Keeping comments as is
          },
          user: {
            id: post.userId,
            name: post.userName,
            profile_image: post.userProfileImage,
          },
        };

        callback(null, [formattedPost]); // Wrapping in array to match your existing structure
      });
    });
  },

  // findAll function with optional currentUserId exclusion and search filter
  findAll: ({ currentUserId, search, limit, offset }, callback) => {
    let query = `
    SELECT p.*, 
           COUNT(DISTINCT l.id) AS likes, 
           COUNT(DISTINCT c.id) AS commentCount,
           u.name AS userName,
           u.profile_image AS userProfileImage,
           EXISTS (
             SELECT 1 
             FROM followers 
             WHERE follower_id = ? AND following_id = u.id
           ) AS isFollower
    FROM posts p 
    LEFT JOIN likes l ON p.id = l.postId 
    LEFT JOIN comments c ON p.id = c.postId 
    LEFT JOIN users u ON p.userId = u.id`;

    // Dynamic query construction based on optional parameters
    let conditions = [];
    let queryParams = [currentUserId || null]; // Always needed for follower check

    // Exclude current user's posts if currentUserId is provided
    if (currentUserId) {
      conditions.push("p.userId != ?");
      queryParams.push(currentUserId);
    }

    // Search by title or content if search term is provided
    if (search) {
      conditions.push("(p.title LIKE ? OR p.content LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Append WHERE conditions to the query if any
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    // Add pagination
    query += " GROUP BY p.id, u.id, u.name, u.profile_image";
    query += " ORDER BY p.createdAt DESC LIMIT ? OFFSET ?";
    queryParams.push(limit, offset);

    // Execute the query with dynamically ordered parameters
    db.query(query, queryParams, (error, postResults) => {
      if (error) {
        return callback(error, null);
      }

      if (postResults.length === 0) {
        return callback(null, []); // No results found
      }

      // Format results with post and user details
      const formattedResults = postResults.map((post) => ({
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          image_path: post.image_path,
          createdAt: post.createdAt,
          likes: post.likes,
          commentCount: post.commentCount,
        },
        user: {
          id: post.userId,
          name: post.userName,
          profile_image: post.userProfileImage,
          isFollower: Boolean(post.isFollower),
        },
      }));

      callback(null, formattedResults); // Return formatted results
    });
  },

  getComments: (postId, callback) => {
    const query = `
        SELECT comments.*, users.name, users.profile_image
        FROM comments
        JOIN users ON comments.userId = users.id
        WHERE comments.postId = ?
        ORDER BY comments.createdAt ASC;
    `;
    db.query(query, [postId], callback);
  },

  getLikes: (postId, callback) => {
    const query = `
        SELECT likes.*, users.name, users.profile_image
        FROM likes
        JOIN users ON likes.userId = users.id
        WHERE likes.postId = ?
        ORDER BY likes.createdAt ASC;
    `;
    db.query(query, [postId], callback);
  },

  addLike: (id, postId, userId, emoji, callback) => {
    const query =
      "INSERT INTO likes (id,postId, userId, emoji) VALUES (?,?, ?, ?)";
    db.query(query, [id, postId, userId, emoji], callback);
  },

  removeLike: (postId, userId, callback) => {
    const query = "DELETE FROM likes WHERE postId = ? AND userId = ?";
    db.query(query, [postId, userId], callback);
  },

  addComment: (id, postId, userId, content, callback) => {
    const query =
      "INSERT INTO comments (id, postId, userId, content) VALUES (?,?, ?, ?)";
    db.query(query, [id, postId, userId, content], callback);
  },

  removeComment: (id, callback) => {
    const query = "DELETE FROM comments WHERE id = ?";
    db.query(query, [id], callback);
  },
  isFollower: (userId, followingId, callback) => {
    const query = `
        SELECT 1 
        FROM followers 
        WHERE follower_id = ? AND following_id = ? 
        LIMIT 1`;
    db.query(query, [userId, followingId], (err, results) => {
      if (err) {
        return callback(err, null);
      }
      // Check if we got any results back
      const isFollower = results.length > 0;
      callback(null, isFollower);
    });
  },
};

module.exports = Post;
