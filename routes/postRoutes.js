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
} = require("../controllers/postController");

const router = express.Router();
const { upload } = require("../common/imageUploader");

router.post("/posts", upload.single("image"), createPost);
router.put("/posts/:id", upload.single("image"), updatePost);
router.delete("/posts/:id", deletePost);
router.get("/posts/:id", getPostById);
router.get("/posts", getAllPosts);
router.get("/users/:userId/posts", getPostsByUserId);
router.get("/posts/:id/comments", getComments);
router.get("/posts/:id/likes", getLikes);
router.post("/posts/:id/comments", addComment);
router.delete("/posts/comments/:commentId", removeComment);
router.post("/posts/:id/likes", addLike);
router.delete("/posts/:id/likes", removeLike);

module.exports = router;
