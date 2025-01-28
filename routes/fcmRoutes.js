// routes/fcmRoutes.js
const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");

// POST - Insert or Update FCM Token
router.post("/token", fcmController.saveToken);

// GET - Get all tokens for a user
router.get("/tokens/:userId", fcmController.getTokensByUserId);

// GET - Get all tokens
router.get("/all-tokens", fcmController.getAllTokens);

// GET - Get all tokens with details
router.get("/all-tokens-details", fcmController.getAllTokensWithDetails);

// DELETE - Remove token on logout
router.delete("/token", fcmController.deleteToken);

// POST - Send notification to a device
router.post(
  "/send-notification-by-device-id",
  fcmController.sendNotificationToDevice
);

module.exports = router;
