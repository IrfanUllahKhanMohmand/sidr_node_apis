const express = require("express");

const router = express.Router();

const { createToken } = require("../common/verifyToken");

router.post("/createToken", createToken);

module.exports = router;
