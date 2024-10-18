// controllers/fcmController.js
const FcmToken = require("../models/fcmTokenModel");

const admin = require("firebase-admin");

// Insert or Update FCM Token
exports.saveToken = (req, res) => {
  const { user_id, device_id, token } = req.body;

  if (!user_id || !device_id || !token) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  FcmToken.saveToken(user_id, device_id, token, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to save token" });
    }
    res.status(200).json({ message: "Token saved successfully" });
  });
};

// Get All Tokens for a User
exports.getTokensByUserId = (req, res) => {
  const userId = req.params.userId;

  FcmToken.getTokensByUserId(userId, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve tokens" });
    }
    const tokens = results.map((row) => row.token);
    res.status(200).json({ tokens });
  });
};

//Get All Tokens
exports.getAllTokens = (req, res) => {
  FcmToken.getAllTokens((err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve tokens" });
    }
    const tokens = results.map((row) => row.token);
    res.status(200).json({ tokens });
  });
};

//Get All Tokens with details
exports.getAllTokensWithDetails = (req, res) => {
  FcmToken.getAllTokensWithDetails((err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve tokens" });
    }
    res.status(200).json({ tokens: results });
  });
};

// Delete Token on Logout
exports.deleteToken = (req, res) => {
  const { user_id, device_id } = req.body;

  if (!user_id || !device_id) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  FcmToken.deleteToken(user_id, device_id, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to delete token" });
    }
    res.status(200).json({ message: "Token deleted successfully" });
  });
};

//Send Notification to a User all devices

exports.sendNotification = (req, res) => {
  const { user_id, title, body } = req.body;

  if (!user_id || !title || !body) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  FcmToken.getTokensByUserId(user_id, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to retrieve tokens" });
    }

    const registrationTokens = results.map((row) => row.token);
    const message = {
      data: {
        title: title,
        body: body,
      },
      token: registrationTokens,
    };

    admin
      .messaging()
      .sendMulticast(message)
      .then((response) => {
        res.status(200).json({ message: "Notification sent successfully" });
      })
      .catch((error) => {
        res.status(500).json({ message: "Failed to send notification" });
      });
  });
};

//Send Notification to a device by device_id

exports.sendNotificationToDevice = (req, res) => {
  const { device_id, title, body } = req.body;

  if (!device_id || !title || !body) {
    return res.status(400).json({ message: "Missing parameters" });
  }
  const message = {
    data: {
      title: title,
      body: body,
    },

    token: device_id,
  };
  admin
    .messaging()
    .send(message)
    .then((response) => {
      res.status(200).json({ message: "Notification sent successfully" });
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to send notification" });
    });
};
