const FrequentSupportMessage = require("../models/frequentSupportMessage")
const crypto = require("crypto");

exports.create = (req, res) => {
    const { message } = req.body
    const id = crypto.randomBytes(16).toString("hex");



    if (!message) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    FrequentSupportMessage.create({ id, message }, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to create frequent support message" })
        }
        res.status(201).json({ message: "Frequent support message created successfully", id: result.insertId })
    })
}

exports.findAll = (req, res) => {
    FrequentSupportMessage.findAll((err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve frequent support messages" })
        }
        res.status(200).json(results)
    })
}

exports.findOne = (req, res) => {
    const id = req.params.id

    FrequentSupportMessage.findById(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve frequent support message" })
        }
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "Frequent support message not found" })
        }
        res.status(200).json(result)
    })
}

exports.update = (req, res) => {
    const id = req.params.id
    const { message } = req.body

    if (!message) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    FrequentSupportMessage.update(id, { message }, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to update frequent support message" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Frequent support message not found" })
        }
        res.status(200).json({ message: "Frequent support message updated successfully" })
    })
}

exports.delete = (req, res) => {
    const id = req.params.id

    FrequentSupportMessage.delete(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to delete frequent support message" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Frequent support message not found" })
        }
        res.status(200).json({ message: "Frequent support message deleted successfully" })
    })
}

