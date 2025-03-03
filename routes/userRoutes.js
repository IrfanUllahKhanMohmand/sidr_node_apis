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
const { verifyToken, sendEmailVerification,
  verifyEmailCode, sendPasswordResetEmail,
  resetPassword, isEmailVerified, isAdmin, removeAdmin, setAdmin } = require("../common/verifyToken");
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


router.get("/is-email-verified", isEmailVerified);
router.post("/verify-email", sendEmailVerification);
router.post("/verify-email-code", verifyEmailCode);
router.post("/send-password-reset-email", sendPasswordResetEmail);
router.post("/reset-password", resetPassword);
router.post("/is-admin", isAdmin);
router.post("/set-admin", setAdmin);
router.post("/remove-admin", removeAdmin);



module.exports = router;
