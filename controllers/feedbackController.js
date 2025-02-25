
const Feedback = require("../models/feedbackModel");

// Create feedback table
const createFeedbackTable = async (req, res) => {
    try {
        Feedback.createFeedbackTable((err, result) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(201).json({
                message: "Feedback table created successfully",
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Create a new createFeedback
const createFeedback = async (req, res) => {
    const { user_id, content } = req.body;

    try {
        Feedback.createFeedback({ user_id, content }, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(201).json({
                message: "Feedback created successfully",
                feedback: result,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Get feedbacks for a user
const getUserFeedbacks = async (req, res) => {
    const user_id = req.params.id;

    try {
        Feedback.getUserFeedbacks(user_id, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(200).json({
                feedbacks: results,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all feedbacks
const getAllFeedbacks = async (req, res) => {
    try {
        Feedback.getAllFeedbacks((err, results) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(200).json({
                feedbacks: results,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete feedback
const deleteFeedback = async (req, res) => {
    const feedbackId = req.params.id;

    try {
        Feedback.deleteFeedback(feedbackId, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(200).json({
                message: "Feedback deleted successfully",
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


// Search feedbacks
const searchFeedbacks = async (req, res) => {
    const search = req.query.search;

    try {
        Feedback.searchFeedbacks(search, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Server error" });
            }

            res.status(200).json({
                feedbacks: results,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = {
    createFeedbackTable,
    createFeedback,
    getUserFeedbacks,
    getAllFeedbacks,
    deleteFeedback,
    searchFeedbacks,
};
