// File: models/Post.js

const db = require("../config/db");

const Post = {
  create: (id, title, content, userId, isAnonymous, imagePath, callback) => {
    const query =
      "INSERT INTO posts (id, title, content, userId, is_anonymous, image_path) VALUES (?,?,?, ?, ?, ?)";
    db.query(
      query,
      [id, title, content, userId, isAnonymous, imagePath],
      callback
    );
  },

  update: (id, title, content, isAnonymous, imagePath, callback) => {
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

    if (isAnonymous !== null) {
      updates.push("is_anonymous = ?");
      values.push(isAnonymous);
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
             ) AS isFollower,
             EXISTS (
               SELECT 1 
               FROM likes 
               WHERE postId = p.id AND userId = ?
             ) AS isLiked
      FROM posts p 
      LEFT JOIN likes l ON p.id = l.postId 
      LEFT JOIN comments c ON p.id = c.postId 
      LEFT JOIN users u ON p.userId = u.id 
      WHERE p.userId = ? 
      GROUP BY p.id, u.id, u.name, u.profile_image
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?`;

    // Execute the query with currentUserId (for both isFollower and isLiked checks), userId, limit, and offset
    db.query(
      query,
      [currentUserId, currentUserId, userId, limit, offset],
      (err, results) => {
        if (err) {
          return callback(err);
        }

        // Format results to include user info, isFollower, and isLiked fields
        const formattedResults = results.map((post) => ({
          post: {
            id: post.id,
            title: post.title,
            content: post.content,
            isAnonymous: Boolean(post.is_anonymous),
            image_path: post.image_path,
            createdAt: post.createdAt,
            likes: post.likes,
            commentCount: post.commentCount,
            isLiked: Boolean(post.isLiked),
          },
          user: {
            id: post.userId,
            name: post.name,
            profile_image: post.profile_image,
            isFollower: Boolean(post.isFollower),
          },
        }));

        callback(null, formattedResults); // Return posts with user info, isFollower, and isLiked fields
      }
    );
  },

  findById: (id, currentUserId, callback) => {
    const postQuery = `
      SELECT p.*, 
             u.name AS userName, 
             u.profile_image AS userProfileImage, 
             COUNT(DISTINCT l.id) AS likes,
             EXISTS (
               SELECT 1 
               FROM likes 
               WHERE postId = p.id AND userId = ?
             ) AS isLiked,
             EXISTS (
               SELECT 1 
               FROM followers 
               WHERE follower_id = ? AND following_id = u.id
             ) AS isFollower
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

    // Execute the post query first
    db.query(
      postQuery,
      [currentUserId, currentUserId, id],
      (error, postResults) => {
        if (error) {
          return callback(error, null);
        }

        if (postResults.length === 0) {
          return callback(null, []);
        }

        const post = postResults[0];

        // Execute the comments query after fetching the post
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
              isAnonymous: Boolean(post.is_anonymous),
              image_path: post.image_path,
              createdAt: post.createdAt,
              likes: post.likes,
              isLiked: Boolean(post.isLiked), // Added isLiked field
              comments: commentResults, // Keeping comments as is
            },
            user: {
              id: post.userId,
              name: post.userName,
              profile_image: post.userProfileImage,
              isFollower: Boolean(post.isFollower), // Added isFollower field
            },
          };

          callback(null, [formattedPost]); // Wrapping in array to match your existing structure
        });
      }
    );
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
             ) AS isFollower`;

    // Add the isLiked check only if currentUserId is provided
    if (currentUserId) {
      query += `,
             EXISTS (
               SELECT 1 
               FROM likes 
               WHERE postId = p.id AND userId = ?
             ) AS isLiked`;
    } else {
      query += `, 0 AS isLiked`; // Default to 0 (false) if no currentUserId
    }

    query += `
      FROM posts p 
      LEFT JOIN likes l ON p.id = l.postId 
      LEFT JOIN comments c ON p.id = c.postId 
      LEFT JOIN users u ON p.userId = u.id`;

    // Dynamic query construction based on optional parameters
    let conditions = [];
    let queryParams = [currentUserId || null]; // Always needed for follower check

    // Add currentUserId again for isLiked check if present
    if (currentUserId) {
      queryParams.push(currentUserId);
    }

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

    // Pagination parameters
    queryParams.push(limit, offset);

    // Execute the query with dynamically ordered parameters
    db.query(query, queryParams, (error, postResults) => {
      if (error) {
        return callback(error, null);
      }

      if (postResults.length === 0) {
        return callback(null, []); // No results found
      }

      // Format results with post and user details including isLiked and isFollower
      const formattedResults = postResults.map((post) => ({
        post: {
          id: post.id,
          title: post.title,
          content: post.content,
          isAnonymous: Boolean(post.is_anonymous),
          image_path: post.image_path,
          createdAt: post.createdAt,
          likes: post.likes,
          commentCount: post.commentCount,
          isLiked: Boolean(post.isLiked), // Added isLiked field
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
