const express = require("express")
const router = express.Router()
const frequentSupportMessageController = require("../controllers/frequentSupportMessageController")

router.post("/frequent-support-messages", frequentSupportMessageController.create)
router.get("/frequent-support-messages", frequentSupportMessageController.findAll)
router.get("/frequent-support-messages/:id", frequentSupportMessageController.findOne)
router.put("/frequent-support-messages/:id", frequentSupportMessageController.update)
router.delete("/frequent-support-messages/:id", frequentSupportMessageController.delete)

module.exports = router

