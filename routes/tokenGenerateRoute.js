const express = require("express");

const router = express.Router();

const {
  createToken,
  listAllUsers,
  enableUser,
  disableUser,
} = require("../common/verifyToken");

router.post("/createToken", createToken);
router.get("/listAllUsers", listAllUsers);
router.post("/enableUser", enableUser);
router.post("/disableUser", disableUser);

module.exports = router;
