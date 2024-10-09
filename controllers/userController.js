// File: controllers/userController.js

const { request } = require("express");
const User = require("../models/User");

const createUser = async (req, res) => {
  const { id, name, email } = req.body;
  const profileImage = req.file ? req.file.location : null;

  if (!id || !name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    await User.create(id, name, email, profileImage);
    return res
      .status(201)
      .json({ id, name, email, profile_image: profileImage });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    return res.status(500).json({ error: "Database error" });
  }
};

const updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email } = req.body;
  const profileImage = req.file ? req.file.location : null;

  // Call the update method with userId and parameters
  User.update(
    userId,
    name || null,
    email || null,
    profileImage,
    (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "User not found" });

      // Prepare response object
      const updatedUser = {
        id: userId,
        ...(name && { name }), // Only include name if it's provided
        ...(email && { email }), // Only include email if it's provided
        ...(profileImage && { profile_image: profileImage }), // Only include profile_image if it's provided
      };

      res.json(updatedUser);
    }
  );
};

const deleteUser = (req, res) => {
  const userId = req.params.id;

  User.delete(userId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  });
};

const getUserById = (req, res) => {
  const userId = req.params.id;

  User.findById(userId, (err, result) => {
    // Handle database errors
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Check if the user was found
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user object as a response
    res.json(result);
  });
};

const getCurrentUser = (req, res) => {
  const userId = req.currentUid;
  User.findById(userId, (err, result) => {
    // Handle database errors
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    // Check if the user was found
    if (!result) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send the user object as a response
    res.json(result);
  });
};

const getAllUsers = (req, res) => {
  // Extract pagination parameters from query, with defaults
  const limit = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const offset = (page - 1) * limit;

  // Call the findAll method with pagination parameters
  User.findAll({ limit, offset }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error", err });
    }
    res.json(result);
  });
};

const getFollowers = (req, res) => {
  const userId = req.params.id; // User whose followers are being fetched

  User.getFollowers(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.json([]);
    }

    // Map the result to return complete user details instead of just follower_id
    res.json(result); // result already contains full user details
  });
};

const getCurrentUserFollowers = (req, res) => {
  const userId = req.currentUid; // User whose followers are being fetched

  User.getFollowers(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.json([]);
    }

    // Map the result to return complete user details instead of just follower_id
    res.json(result); // result already contains full user details
  });
};

const addFollowing = (req, res) => {
  const userId = req.params.id; // User being followed
  const followingId = req.currentUid; // User who is following

  User.addFollowing(followingId, userId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result && result.message) {
      return res.json(result); // Handle already exists case
    }

    res.json({ message: "User followed successfully" });
  });
};

const removeFollowing = (req, res) => {
  const userId = req.params.id; // User being unfollowed
  const followingId = req.currentUid; // User who is unfollowing

  User.removeFollowing(userId, followingId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.affectedRows === 0) return res.json([]);

    res.json({ message: "User unfollowed successfully" });
  });
};

const getFollowings = (req, res) => {
  const userId = req.params.id; // User whose followings are being fetched

  User.getFollowings(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.json([]); // Return an empty array if no followings found
    }

    // Map the result to return complete user details instead of just following_id
    res.json(result); // result already contains full user details
  });
};

const getCurrentUserFollowings = (req, res) => {
  const userId = req.currentUid; // User whose followings are being fetched

  User.getFollowings(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.json([]); // Return an empty array if no followings found
    }

    // Map the result to return complete user details instead of just following_id
    res.json(result); // result already contains full user details
  });
};

module.exports = {
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
};
