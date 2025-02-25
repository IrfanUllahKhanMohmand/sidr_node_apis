const express = require("express")
const router = express.Router()
const supportMessageController = require("../controllers/supportMessageController")
const { upload } = require("../common/imageUploader");
const { verifyToken } = require("../common/verifyToken");


router.post("/support-messages", verifyToken, upload.single("media"), supportMessageController.create)
router.get("/support-messages", verifyToken, supportMessageController.findAll)
router.get("/support-conversations", verifyToken, supportMessageController.getConversations)
router.get("/support-messages/:id", verifyToken, supportMessageController.getMessagesWithUser)
router.delete("/support-messages/:id", verifyToken, supportMessageController.delete)

module.exports = router

