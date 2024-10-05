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

  findByUserId: (userId, callback) => {
    const query = `
    SELECT p.*, 
           u.name, 
           u.profile_image, 
           COUNT(DISTINCT l.id) AS likes, 
           COUNT(DISTINCT c.id) AS commentCount 
    FROM posts p 
    LEFT JOIN likes l ON p.id = l.postId 
    LEFT JOIN comments c ON p.id = c.postId 
    LEFT JOIN users u ON p.userId = u.id 
    WHERE p.userId = ? 
    GROUP BY p.id, u.id, u.name, u.profile_image
  `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        return callback(err);
      }

      // Transform results to include user info in a separate object
      const formattedResults = results.map((post) => ({
        post: {
          id: post.id,
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
        },
      }));

      callback(null, formattedResults);
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

  findAll: (callback) => {
    const postsQuery = `
      SELECT p.*, 
             COUNT(DISTINCT l.id) AS likes, 
             COUNT(DISTINCT c.id) AS commentCount,
             u.name AS userName,
             u.profile_image AS userProfileImage
      FROM posts p 
      LEFT JOIN likes l ON p.id = l.postId 
      LEFT JOIN comments c ON p.id = c.postId 
      LEFT JOIN users u ON p.userId = u.id
      GROUP BY p.id, u.id, u.name, u.profile_image
    `;

    db.query(postsQuery, (error, postResults) => {
      if (error) {
        return callback(error, null);
      }

      if (postResults.length === 0) {
        return callback(null, []);
      }

      // Transform results to include user info in a separate object
      const formattedResults = postResults.map((post) => ({
        post: {
          id: post.id,
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
        },
      }));

      callback(null, formattedResults); // Return the array of posts with user info and counts
    });
  },

  getComments: (postId, callback) => {
    const query = "SELECT * FROM comments WHERE postId = ?";
    db.query(query, [postId], callback);
  },

  getLikes: (postId, callback) => {
    const query = "SELECT * FROM likes WHERE postId = ?";
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
};

module.exports = Post;
