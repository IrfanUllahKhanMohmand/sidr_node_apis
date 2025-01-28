// /controllers/donationController.js
const Donation = require("../models/donationModel");
const crypto = require("crypto");
const db = require("../config/db");

const createDonation = async (req, res) => {
  const { charityPageId, amount, payment_method } = req.body;
  const userId = req.currentUid;

  try {
    const id = crypto.randomBytes(16).toString("hex");

    const donationData = { id, userId, charityPageId, amount, payment_method };

    await Donation.create(donationData, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      res.status(201).json({
        message: "Donation created successfully",
        donation: result,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllDonations = async (req, res) => {
  try {
    Donation.getAll((err, donations) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ donations });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDonationsByCharityPageId = async (req, res) => {
  const { id } = req.params;

  try {
    Donation.getDonationsByCharityPageId(id, (err, donations) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ donations });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDonationById = async (req, res) => {
  const { id } = req.params;

  try {
    Donation.getDonationById(id, (err, donation) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      if (donation.length === 0) {
        return res.status(404).json({ message: "Donation not found" });
      }

      res.json({ donation: donation[0] });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getDonationsByUserId = async (req, res) => {
  const { id } = req.params;

  try {
    Donation.getDonationsByUserId(id, (err, donations) => {
      if (err) {
        return res.status(500).json({ message: "Server error" });
      }

      res.json({ donations });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createDonation,
  getAllDonations,
  getDonationsByCharityPageId,
  getDonationById,
  getDonationsByUserId,
};
