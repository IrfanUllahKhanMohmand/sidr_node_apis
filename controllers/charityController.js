// controllers/charityController.js
const CharityPage = require("../models/charityModel");

const createCharityPage = (req, res) => {
  const { name, location, description } = req.body;
  const pageData = { name, location, description };

  const userId = req.currentUid;

  const profileImage = req.files?.profile_image?.[0]?.location || null;
  const coverImage = req.files?.cover_image?.[0]?.location || null;
  const frontImage = req.files?.front_image?.[0]?.location || null;
  const backImage = req.files?.back_image?.[0]?.location || null;

  pageData.profile_image = profileImage;
  pageData.cover_image = coverImage;
  pageData.front_image = frontImage;
  pageData.back_image = backImage;
  pageData.userId = userId;

  if (
    !name ||
    !location ||
    !description ||
    !frontImage ||
    !backImage ||
    !profileImage ||
    !coverImage
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  CharityPage.createPage(pageData, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to create charity page" });
    } else {
      res
        .status(201)
        .json({ message: "Charity page created successfully", page: result });
    }
  });
};

const updateCharityPage = (req, res) => {
  const pageId = req.params.id;
  const { name, location, description } = req.body;

  // Collect all potential data fields, including images and userId
  const pageData = {
    name,
    location,
    description,
    profile_image: req.files?.profile_image?.[0]?.location || null,
    cover_image: req.files?.cover_image?.[0]?.location || null,
    front_image: req.files?.front_image?.[0]?.location || null,
    back_image: req.files?.back_image?.[0]?.location || null,
  };

  // Filter out fields that are null
  const filteredPageData = Object.fromEntries(
    Object.entries(pageData).filter(([_, value]) => value !== null)
  );

  // Pass filtered data to the update function
  CharityPage.updatePage(pageId, filteredPageData, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to update charity page" });
    } else {
      res.status(200).json({
        message: "Charity page updated successfully",
        page: result,
      });
    }
  });
};

const activateCharityPage = (req, res) => {
  const pageId = req.params.id;

  CharityPage.updatePageStatus(pageId, "active", (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to activate charity page" });
    } else {
      res.status(200).json({ message: "Charity page activated successfully" });
    }
  });
};

const deactivateCharityPage = (req, res) => {
  const pageId = req.params.id;

  CharityPage.updatePageStatus(pageId, "inactive", (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to deactivate charity page" });
    } else {
      res
        .status(200)
        .json({ message: "Charity page deactivated successfully" });
    }
  });
};

const deleteCharityPage = (req, res) => {
  const pageId = req.params.id;

  CharityPage.deletePage(pageId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to delete charity page" });
    } else {
      res.status(200).json({ message: "Charity page deleted successfully" });
    }
  });
};

const getCharityPageById = (req, res) => {
  const pageId = req.params.id;

  CharityPage.getPageById(pageId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to get charity page" });
    } else {
      res.status(200).json({ page: result });
    }
  });
};

const getCharityPagesByUserId = (req, res) => {
  const userId = req.params.userId;
  const pageSize = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const search = req.query.search || null;
  const isInactive = req.query.inactive || false;

  CharityPage.getPagesByUserId(
    { userId, page, pageSize, search, isInactive },
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Failed to get charity pages" });
      } else {
        res.status(200).json({ pages: result });
      }
    }
  );
};

const getCurrentUserCharityPages = (req, res) => {
  const userId = req.currentUid;
  const pageSize = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const search = req.query.search || null;
  const isInactive = req.query.inactive || false;

  CharityPage.getPagesByUserId(
    { userId, page, pageSize, search, isInactive },
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Failed to get charity pages" });
      } else {
        res.status(200).json({ pages: result });
      }
    }
  );
};

const getAllCharitiePages = (req, res) => {
  const excludeId = req.currentUid || null;
  const pageSize = parseInt(req.query.limit, 10) || 10; // Default limit to 10
  const page = parseInt(req.query.page, 10) || 1; // Default page to 1
  const search = req.query.search || null;
  const isInactive = req.query.inactive || false;

  CharityPage.getPages(
    { page, pageSize, search, excludeId, isInactive },
    (err, result) => {
      if (err) {
        res.status(500).json({ error: "Failed to get charity pages" });
      } else {
        res.status(200).json({ pages: result });
      }
    }
  );
};

const followCharityPage = (req, res) => {
  const userId = req.currentUid;
  const charityPageId = req.params.id;

  CharityPage.followPage(userId, charityPageId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to follow charity page" });
    } else {
      res.status(200).json({ message: "Charity page followed successfully" });
    }
  });
};

const unfollowCharityPage = (req, res) => {
  const userId = req.currentUid;
  const charityPageId = req.params.id;

  CharityPage.unfollowPage(userId, charityPageId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to unfollow charity page" });
    } else {
      res.status(200).json({ message: "Charity page unfollowed successfully" });
    }
  });
};

const getCharityPageFollowers = (req, res) => {
  const pageId = req.params.id;

  CharityPage.getCharityPageFollowers(pageId, (err, result) => {
    if (err) {
      res.status(500).json({ error: "Failed to get charity page followers" });
    } else {
      res.status(200).json({ followers: result });
    }
  });
};

module.exports = {
  createCharityPage,
  updateCharityPage,
  deleteCharityPage,
  getCharityPageById,
  getCharityPagesByUserId,
  getAllCharitiePages,
  getCurrentUserCharityPages,
  followCharityPage,
  unfollowCharityPage,
  getCharityPageFollowers,
  activateCharityPage,
  deactivateCharityPage,
};
