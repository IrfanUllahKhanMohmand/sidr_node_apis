// routes/reportRoutes.js
const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const { verifyToken } = require("../common/verifyToken");

// Route to report a post
router.post("/report", verifyToken, reportController.reportPost);

// Route to fetch reports by post ID
router.get("/reports/post/:postId", reportController.getReportsByPostId);

// Route to fetch reports by user ID
router.get("/reports/user/:userId", reportController.getReportsByUserId);

// Route to fetch all reports
router.get("/reports", reportController.getAllReports);

// Route to resolve a report
router.put("/report/:id", reportController.resolveReport);

module.exports = router;
