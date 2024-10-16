// controllers/reportController.js
const Report = require("../models/Report");
const crypto = require("crypto");

// Report a post
exports.reportPost = (req, res) => {
  const { postId, userId, reason } = req.body;
  const reportingUserId = req.currentUid;
  const report = {
    id: crypto.randomBytes(16).toString("hex"),
    postId,
    userId,
    reason,
    reportingUserId,
  };

  Report.create(report, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reporting post", error: err });
    }
    res.status(201).json({ message: "Report submitted successfully", report });
  });
};

// Get reports by post ID
exports.getReportsByPostId = (req, res) => {
  const { postId } = req.params;
  const { reportStatus } = req.query;

  Report.findByPostId({ postId, reportStatus }, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }
    res.status(200).json({ reports: results });
  });
};

// Get reports by user ID
exports.getReportsByUserId = (req, res) => {
  const { userId } = req.params;
  const { reportStatus } = req.query;
  Report.findByUserId({ userId, reportStatus }, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }
    res.status(200).json({ reports: results });
  });
};

// Get all reports
exports.getAllReports = (req, res) => {
  const { reportStatus } = req.query;
  Report.findAll({ reportStatus }, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }
    res.status(200).json({ reports: results });
  });
};

// Mark report as resolved
exports.resolveReport = (req, res) => {
  const { id } = req.params;
  Report.markAsResolved(id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error resolving report", error: err });
    }
    res.status(200).json({ message: "Report resolved successfully" });
  });
};

// Delete report
exports.deleteReport = (req, res) => {
  const { reportId } = req.params;
  Report.delete(reportId, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting report", error: err });
    }
    res.status(200).json({ message: "Report deleted successfully" });
  });
};
