// File: controllers/postController.js

const Post = require("../models/Post");
const crypto = require("crypto");
const createPost = (req, res) => {
  const { title, content, charityPageId } = req.body; // Accept charityPageId from the request body
  const isAnonymous = req.body.isAnonymous === "true" ? 1 : 0;
  const userId = req.currentUid; // This will be the user ID from the request
  const imagePath = req.file ? req.file.location : null;
  const id = crypto.randomBytes(16).toString("hex");

  // Validate required fields: title, content, and either userId or charityPageId
  if (!title || !content || (!userId && !charityPageId)) {
    return res.status(400).json({
      error: "Title, content, and either userId or charityPageId are required",
    });
  }

  // Call the create method, passing either userId or charityPageId
  Post.create(
    id,
    title,
    content,
    userId || null, // If no userId, pass null
    charityPageId || null, // If no charityPageId, pass null
    isAnonymous,
    imagePath,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.status(201).json({
        id: id,
        title: title,
        content: content,
        user_id: userId || null, // Include user_id if available
        charity_page_id: charityPageId || null, // Include charity_page_id if available
        is_anonymous: isAnonymous,
        ...(imagePath && { image_path: imagePath }),
      });
    }
  );
};

const updatePost = (req, res) => {
  const postId = req.params.id;
  const { title, content, isAnonymous: isAnonymousString } = req.body;
  const isAnonymous =
    isAnonymousString !== undefined
      ? isAnonymousString === "true"
        ? 1
        : 0
      : null;
  const imagePath = req.file ? req.file.location : null;

  Post.update(
    postId,
    title || null,
    content || null,
    isAnonymous,
    imagePath || null,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Post not found" });

      // Prepare response object with only updated fields
      const updatedPost = {
        id: postId,
        ...(title && { title }),
        ...(content && { content }),
        ...(isAnonymous !== null && { is_anonymous: isAnonymous }),
        ...(imagePath && { image_path: imagePath }),
      };

      res.json(updatedPost);
    }
  );
};

const deletePost = (req, res) => {
  const postId = req.params.id;

  Post.delete(postId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Post not found" });

    res.json({ message: "Post deleted successfully" });
  });
};

const getPostById = (req, res) => {
  const postId = req.params.id;

  const currentUserId = req.currentUid;

  Post.findById(postId, currentUserId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "Post not found" });

    res.json(result);
  });
};

const getPostsByUserIdOrCharityId = (req, res) => {
  const id = req.params.id;
  const type = req.params.type; // 'user' or 'charityPage'
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;

  const currentUserId = req.currentUid;

  // Validate the type
  if (type !== "user" && type !== "charityPage") {
    return res.status(400).json({
      error: "Invalid type. Type must be either 'user' or 'charityPage'",
    });
  }

  // Call the findByUserIdOrCharityId method with pagination parameters
  Post.findByUserIdOrCharityId(
    id,
    type,
    currentUserId,
    { limit, offset },
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(result);
    }
  );
};

const getPostsByUserId = (req, res) => {
  const userId = req.params.userId;
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;

  const currentUserId = req.currentUid;

  // Call the findByUserId method with pagination parameters
  Post.findByUserIdOrCharityId(
    userId,
    "user",
    currentUserId,
    { limit, offset },
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(result);
    }
  );
};

const getCurrentUserPosts = (req, res) => {
  const userId = req.currentUid;
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;

  // Call the findByUserId method with pagination parameters
  Post.findByUserIdOrCharityId(
    userId,
    "user",
    userId,
    { limit, offset },
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(result);
    }
  );
};

const getAllPosts = (req, res) => {
  // Extract pagination parameters from query, with defaults
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;
  const search = req.query.search;

  // Call the findAll method with pagination parameters
  Post.findAll({ search, limit, offset }, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error", err });
    res.json(result);
  });
};

const getAllPostsExceptUser = (req, res) => {
  // Extract pagination parameters from query, with defaults
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;
  const currentUserId = req.currentUid;
  const search = req.query.search;

  // Call the findAll method with pagination parameters
  Post.findAll({ currentUserId, search, limit, offset }, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
};

const getComments = (req, res) => {
  const postId = req.params.id;

  Post.getComments(postId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
};

const getLikes = (req, res) => {
  const postId = req.params.id;

  Post.getLikes(postId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
};

const addComment = (req, res) => {
  const { content } = req.body;
  const userId = req.currentUid;
  const postId = req.params.id;
  const id = crypto.randomBytes(16).toString("hex");
  if (!content || !userId) {
    return res.status(400).json({ error: "Content and userId are required" });
  }

  Post.addComment(id, postId, userId, content, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({
      id,
      content,
      userId,
      post_id: postId,
    });
  });
};

const removeComment = (req, res) => {
  const commentId = req.params.commentId;

  Post.removeComment(commentId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Comment not found" });

    res.json({ message: "Comment deleted successfully" });
  });
};

const addLike = (req, res) => {
  const userId = req.currentUid;
  const emoji = req.body.emoji;
  const postId = req.params.id;
  const id = crypto.randomBytes(16).toString("hex");

  Post.addLike(id, postId, userId, emoji, (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Like already exists" });
      }
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ message: "Like added successfully" });
  });
};

const removeLike = (req, res) => {
  const userId = req.currentUid;
  const postId = req.params.id;

  Post.removeLike(postId, userId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ message: "Like removed successfully" });
  });
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  getPostById,
  getComments,
  getLikes,
  addComment,
  removeComment,
  addLike,
  removeLike,
  getPostsByUserId,
  getAllPosts,
  getCurrentUserPosts,
  getAllPostsExceptUser,
  getPostsByUserIdOrCharityId,
};
