const express = require("express");
const router = express.Router();

const { verifyToken } = require("../common/verifyToken");

const {
    createFeedbackTable,
    createFeedback,
    getUserFeedbacks,
    getAllFeedbacks,
    deleteFeedback,
    searchFeedbacks,
} = require("../controllers/feedbackController");

// Route to create feedback table
router.get("/feedbacks/create-table", createFeedbackTable);

// Route to create a new feedback
router.post("/feedbacks", verifyToken, createFeedback);

// Route to get all feedbacks
router.get("/feedbacks", verifyToken, getAllFeedbacks);

// Route to get feedbacks for a user
router.get("/feedbacks/:id", verifyToken, getUserFeedbacks);

// Route to delete a feedback
router.delete("/feedbacks/:id", verifyToken, deleteFeedback);

// Route to search feedbacks
router.get("/search-feedback", verifyToken, searchFeedbacks);

module.exports = router;