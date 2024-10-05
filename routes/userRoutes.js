// File: routes/userRoutes.js

const express = require("express");
const {
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getAllUsers,
  addFollower,
  removeFollower,
  getFollowers,
  addFollowing,
  removeFollowing,
  getFollowings,
} = require("../controllers/userController");
const { upload } = require("../common/imageUploader");
const router = express.Router();

router.post("/users", upload.single("profile_image"), createUser);
router.put("/users/:id", upload.single("profile_image"), updateUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:id", getUserById);
router.get("/users", getAllUsers);
router.post("/users/:id/followers", addFollower);
router.delete("/users/:id/followers", removeFollower);
router.get("/users/:id/followers", getFollowers);
router.post("/users/:id/followings", addFollowing);
router.delete("/users/:id/followings", removeFollowing);
router.get("/users/:id/followings", getFollowings);

module.exports = router;
