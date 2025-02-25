const FAQ = require("../models/faq")
const crypto = require("crypto");

exports.create = (req, res) => {
    const { question, answer } = req.body
    const id = crypto.randomBytes(16).toString("hex");

    if (!question || !answer) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    FAQ.create({ id, question, answer }, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to create FAQ" })
        }
        res.status(201).json({ message: "FAQ created successfully", id: result.insertId })
    })
}

exports.findAll = (req, res) => {
    FAQ.findAll((err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve FAQs" })
        }
        res.status(200).json(results)
    })
}

exports.findOne = (req, res) => {
    const id = req.params.id

    FAQ.findById(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve FAQ" })
        }
        if (!result) {
            return res.status(404).json({ message: "FAQ not found" })
        }
        res.status(200).json(result)
    })
}

exports.update = (req, res) => {
    const id = req.params.id
    const { question, answer } = req.body

    if (!question || !answer) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    FAQ.update(id, { question, answer }, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to update FAQ" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "FAQ not found" })
        }
        res.status(200).json({ message: "FAQ updated successfully" })
    })
}

exports.delete = (req, res) => {
    const id = req.params.id

    FAQ.delete(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to delete FAQ" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "FAQ not found" })
        }
        res.status(200).json({ message: "FAQ deleted successfully" })
    })
}

