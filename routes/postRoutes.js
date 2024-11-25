// File: routes/postRoutes.js

const express = require("express");
const {
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
} = require("../controllers/postController");

const router = express.Router();
const { upload } = require("../common/imageUploader");
const { verifyToken } = require("../common/verifyToken");

router.post("/posts", upload.single("image"), verifyToken, createPost);
router.put("/posts/:id", upload.single("image"), verifyToken, updatePost);
router.delete("/posts/:id", verifyToken, deletePost);
router.get("/posts/:id", verifyToken, getPostById);
router.get("/posts-me", verifyToken, getCurrentUserPosts);
router.get("/posts", verifyToken, getAllPostsExceptUser);
router.get("/all-posts", getAllPosts);
router.get("/users/:type/:id/posts", verifyToken, getPostsByUserIdOrCharityId);
router.get("/posts/:id/comments", verifyToken, getComments);
router.get("/posts/:id/likes", verifyToken, getLikes);
router.post("/posts/:id/comments", verifyToken, addComment);
router.delete("/posts/comments/:commentId", verifyToken, removeComment);
router.post("/posts/:id/likes", verifyToken, addLike);
router.delete("/posts/:id/likes", verifyToken, removeLike);

module.exports = router;
