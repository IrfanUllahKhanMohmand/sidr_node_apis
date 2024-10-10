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
} = require("../controllers/charityController");

router.post(
  "/charities",
  upload.fields([
    { name: "front_image", maxCount: 1 },
    { name: "back_image", maxCount: 1 },
  ]),
  verifyToken,
  createCharityPage
);

router.put(
  "/charities/:id",
  upload.fields([
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

module.exports = router;
