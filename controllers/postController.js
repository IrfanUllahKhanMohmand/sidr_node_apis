// File: controllers/postController.js

const Post = require("../models/Post");
const crypto = require("crypto");
const createPost = (req, res) => {
  const { title, content, userId } = req.body;
  const imagePath = req.file ? req.file.location : null;
  const id = crypto.randomBytes(16).toString("hex");

  if (!title || !content || !userId) {
    return res
      .status(400)
      .json({ error: "Title, content, and userId are required" });
  }

  Post.create(id, title, content, userId, imagePath, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.status(201).json({
      id: id,
      title: title,
      content: content,
      user_id: userId,
      ...(imagePath && { image_path: imagePath }),
    });
  });
};

const updatePost = (req, res) => {
  const postId = req.params.id;
  const { title, content } = req.body;
  const imagePath = req.file ? req.file.location : null;

  Post.update(
    postId,
    title || null,
    content || null,
    imagePath,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Post not found" });

      // Prepare response object
      const updatedPost = {
        id: postId,
        ...(title && { title }), // Only include title if it's provided
        ...(content && { content }), // Only include content if it's provided
        ...(imagePath && { image_path: imagePath }), // Only include image_path if it's provided
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

  Post.findById(postId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "Post not found" });

    res.json(result[0]);
  });
};

const getPostsByUserId = (req, res) => {
  const userId = req.params.userId;

  Post.findByUserId(userId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json(result);
  });
};

const getAllPosts = (req, res) => {
  Post.findAll((err, result) => {
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
  const { content, userId } = req.body;
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
  const userId = req.body.userId;
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
  const userId = req.body.userId;
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
};
