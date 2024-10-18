// File: routes/userRoutes.js

const express = require("express");
const {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getCurrentUser,
  getAllUsers,
  getFollowers,
  getCurrentUserFollowers,
  addFollowing,
  removeFollowing,
  getFollowings,
  getCurrentUserFollowings,
  searchUsers,
  getAllExceptUser,
} = require("../controllers/userController");
const { verifyToken } = require("../common/verifyToken");
const { upload } = require("../common/imageUploader");
const router = express.Router();

router.post("/verify-token", verifyToken);
router.post("/users", upload.single("profile_image"), createUser);
router.put(
  "/users/:id",
  upload.single("profile_image"),
  verifyToken,
  updateUser
);
router.delete("/users/:id", verifyToken, deleteUser);
router.get("/users/:id", verifyToken, getUserById);
router.get("/users-me", verifyToken, getCurrentUser);
router.get("/users", getAllUsers);
router.get("/search/users", verifyToken, searchUsers);
router.get("/users-except-me", verifyToken, getAllExceptUser);
router.get("/users/:id/followers", verifyToken, getFollowers);
router.get("/users-me/followers", verifyToken, getCurrentUserFollowers);
router.post("/users/:id/followings", verifyToken, addFollowing);
router.delete("/users/:id/followings", verifyToken, removeFollowing);
router.get("/users/:id/followings", verifyToken, getFollowings);
router.get("/users-me/followings", verifyToken, getCurrentUserFollowings);

module.exports = router;
