const express = require("express");

const router = express.Router();
const { upload } = require("../common/imageUploader");

const { verifyToken } = require("../common/verifyToken");
const {
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
  getCharityPagesFollowedByUser,
} = require("../controllers/charityController");
const { Route53RecoveryControlConfig } = require("aws-sdk");

router.post(
  "/charities",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
    { name: "front_image", maxCount: 1 },
    { name: "back_image", maxCount: 1 },
  ]),
  verifyToken,
  createCharityPage
);

router.put(
  "/charities/:id",
  upload.fields([
    { name: "profile_image", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
    { name: "front_image", maxCount: 1 },
    { name: "back_image", maxCount: 1 },
  ]),
  verifyToken,
  updateCharityPage
);

router.delete("/charities/:id", verifyToken, deleteCharityPage);

router.get("/charities/:id", verifyToken, getCharityPageById);

router.get("/charities-me", verifyToken, getCurrentUserCharityPages);

router.get("/users/:userId/charities", verifyToken, getCharityPagesByUserId);

router.get("/charities", verifyToken, getAllCharitiePages);

router.get("/all-charities", getAllCharitiePages);

router.put("/charity-activate/:id", activateCharityPage);

router.put("/charity-deactivate/:id", deactivateCharityPage);

router.post("/charities/:id/follow", verifyToken, followCharityPage);

router.post("/charities/:id/unfollow", verifyToken, unfollowCharityPage);

router.get("/charities/:id/followers", verifyToken, getCharityPageFollowers);

//get charity pages followed by user
router.get("/charities-followed", verifyToken, getCharityPagesFollowedByUser);

module.exports = router;
