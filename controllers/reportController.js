// controllers/reportController.js
const Report = require("../models/Report");
const crypto = require("crypto");
const admin = require("firebase-admin");

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
exports.getReportsByPostId = async (req, res) => {
  const { postId } = req.params;
  const { reportStatus } = req.query;

  Report.findByPostId({ postId, reportStatus }, async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }

    // Format the results, including checking if the user is disabled
    const formattedResults = await Promise.all(
      results.map(async (report) => {
        // Check if the user is disabled
        const firebaseUser = await admin.auth().getUser(report.userId);
        const isDisabled = firebaseUser.disabled;

        return {
          report: {
            id: report.id,
            postId: report.postId,
            userId: report.userId,
            reporting_user_id: report.reporting_user_id,
            status: report.status,
            reason: report.reason,
          },
          user: {
            id: report.user_id,
            name: report.user_name,
            email: report.user_email,
            profile_image: report.user_profile_image,
            isDisabled: isDisabled, // Add the isDisabled field here
          },
          post: {
            id: report.post_id,
            userId: report.post_userId,
            image_path: report.post_image_path,
            title: report.post_title,
            content: report.post_content,
            createdAt: report.post_createdAt,
          },
        };
      })
    );

    // Send the response with formatted data
    res.status(200).json({ reports: formattedResults });
  });
};

// Get reports by user ID
exports.getReportsByUserId = async (req, res) => {
  const { userId } = req.params;
  const { reportStatus } = req.query;

  Report.findByUserId({ userId, reportStatus }, async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }

    // Format the results, including checking if the user is disabled
    const formattedResults = await Promise.all(
      results.map(async (report) => {
        // Check if the user is disabled
        const firebaseUser = await admin.auth().getUser(report.userId);
        const isDisabled = firebaseUser.disabled;

        return {
          report: {
            id: report.id,
            postId: report.postId,
            userId: report.userId,
            reporting_user_id: report.reporting_user_id,
            status: report.status,
            reason: report.reason,
          },
          user: {
            id: report.user_id,
            name: report.user_name,
            email: report.user_email,
            profile_image: report.user_profile_image,
            isDisabled: isDisabled, // Add the isDisabled field here
          },
          post: {
            id: report.post_id,
            userId: report.post_userId,
            image_path: report.post_image_path,
            title: report.post_title,
            content: report.post_content,
            createdAt: report.post_createdAt,
          },
        };
      })
    );

    // Send the response with formatted data
    res.status(200).json({ reports: formattedResults });
  });
};

// Get all reports
exports.getAllReports = async (req, res) => {
  const { reportStatus } = req.query;

  // Fetch reports based on the report status
  Report.findAll({ reportStatus }, async (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching reports", error: err });
    }

    // Use Promise.all to wait for asynchronous `isUserDisabled` checks
    const formattedResults = await Promise.all(
      results.map(async (report) => {
        // Check if the user is disabled
        const firebaseUser = await admin.auth().getUser(report.userId);
        const isDisabled = firebaseUser.disabled;

        return {
          report: {
            id: report.id,
            postId: report.postId,
            userId: report.userId,
            reporting_user_id: report.reporting_user_id,
            status: report.status,
            reason: report.reason,
          },
          user: {
            id: report.user_id,
            name: report.user_name,
            email: report.user_email,
            profile_image: report.user_profile_image,
            isDisabled: isDisabled, // Add the isDisabled field here
          },
          post: {
            id: report.post_id,
            userId: report.post_userId,
            image_path: report.post_image_path,
            title: report.post_title,
            content: report.post_content,
            createdAt: report.post_createdAt,
          },
        };
      })
    );

    // Send the response with formatted data
    res.status(200).json({ reports: formattedResults });
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
