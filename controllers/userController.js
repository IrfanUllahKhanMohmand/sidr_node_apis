// File: controllers/userController.js

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

const getAllUsers = (req, res) => {
  User.findAll((err, result) => {
    // Handle database errors
    if (err) {
      return res.status(500).json({ error: "Database error", err });
    }

    // Send the array of users as a response
    res.json(result);
  });
};

const addFollower = (req, res) => {
  const userId = req.params.id; // User being followed
  const followerId = req.body.follower_id; // User who is following

  User.addFollower(userId, followerId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result && result.message) {
      return res.json(result); // Handle already exists case
    }

    res.json({ message: "Follower added successfully" });
  });
};

const removeFollower = (req, res) => {
  const userId = req.params.id; // User being unfollowed
  const followerId = req.body.follower_id; // User who is unfollowing

  User.removeFollower(userId, followerId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Follow relationship not found" });

    res.json({ message: "Follower removed successfully" });
  });
};

const getFollowers = (req, res) => {
  const userId = req.params.id; // User whose followers are being fetched

  User.getFollowers(userId, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res
        .status(404)
        .json({ error: "No followers found for this user" });
    }

    // Map the result to return complete user details instead of just follower_id
    res.json(result); // result already contains full user details
  });
};

const addFollowing = (req, res) => {
  const userId = req.params.id; // User who is following
  const followingId = req.body.following_id; // User being followed

  User.addFollowing(userId, followingId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result && result.message) {
      return res.json(result); // Handle already exists case
    }

    res.json({ message: "Following added successfully" });
  });
};

const removeFollowing = (req, res) => {
  const userId = req.params.id; // User who is unfollowing
  const followingId = req.body.following_id; // User being unfollowed

  User.removeFollowing(userId, followingId, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.affectedRows === 0) return res.json([]);

    res.json({ message: "Following removed successfully" });
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
module.exports = {
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
};
