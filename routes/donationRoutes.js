// /routes/donationRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../common/verifyToken");
const {
  createDonation,
  getAllDonations,
  getDonationsByCharityPageId,
  getDonationById,
  deleteDonation,
  getDonationsByUserId,
} = require("../controllers/donationController");

router.post("/donations", verifyToken, createDonation);
router.get("/donations", verifyToken, getAllDonations);
router.get("/donations/charity/:id", verifyToken, getDonationsByCharityPageId);
router.get("/donations/:id", verifyToken, getDonationById);
router.delete("/donations/:id", verifyToken, deleteDonation);
router.get("/donations/user/:id", verifyToken, getDonationsByUserId);

module.exports = router;
