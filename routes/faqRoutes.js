const express = require("express")
const router = express.Router()
const faqController = require("../controllers/faqController")

router.post("/faqs", faqController.create)
router.get("/faqs", faqController.findAll)
router.get("/faqs/:id", faqController.findOne)
router.put("/faqs/:id", faqController.update)
router.delete("/faqs/:id", faqController.delete)

module.exports = router

