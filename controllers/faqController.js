// Updated FAQ Controller
const faqModel = require("../models/faq")
const crypto = require("crypto");

exports.create = (req, res) => {
    const { question, answer } = req.body
    const id = crypto.randomBytes(16).toString("hex");

    if (!question || !answer) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    const faqData = {
        id,
        question,
        answer
    };

    faqModel.createFaq(faqData, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({
            message: "FAQ created successfully",
            faqData
        });
    });
}

exports.findAll = (req, res) => {
    faqModel.findAll((err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
}

exports.findOne = (req, res) => {
    const id = req.params.id

    faqModel.findById(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "FAQ not found" });
        }
        res.status(200).json(result[0]);
    });
}

exports.update = (req, res) => {
    const id = req.params.id
    const { question, answer } = req.body

    if (!question || !answer) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    faqModel.update(id, { question, answer }, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "FAQ not found" });
        }
        res.status(200).json({ message: "FAQ updated successfully" });
    });
}

exports.delete = (req, res) => {
    const id = req.params.id

    faqModel.delete(id, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "FAQ not found" });
        }
        res.status(200).json({ message: "FAQ deleted successfully" });
    });
}