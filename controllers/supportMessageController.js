const SupportMessage = require("../models/supportMessage")
const crypto = require("crypto");


exports.create = (req, res) => {
    const { receiver_id, message, type } = req.body;
    const media_url = req.file ? req.file.location : null;
    const id = crypto.randomBytes(16).toString("hex");
    const sender_id = req.currentUid;

    if (!receiver_id || !message) {
        return res.status(400).json({ message: "Missing required parameters" })
    }
    const messageData = {
        id,
        sender_id,
        receiver_id,
        message,
        type,
        receiver_type: "user",
        media_url,
    };

    SupportMessage.create(messageData, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to create support message" })
        }
        res.status(201).json({ message: "Support message created successfully", id: result.insertId })
    })
}

//fetch support conversations
exports.getConversations = (req, res) => {
    const user_id = req.currentUid

    SupportMessage.getConversations(user_id, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve support conversations" })
        }
        res.status(200).json(results)
    })
}

//getMessagesWithUser
exports.getMessagesWithUser = (req, res) => {
    const user_id = req.currentUid
    const receiver_id = req.params.id

    SupportMessage.getMessagesWithUser(user_id, receiver_id, (err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve support messages" })
        }
        res.status(200).json(results)
    })
}


exports.findAll = (req, res) => {
    SupportMessage.findAll((err, results) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve support messages" })
        }
        res.status(200).json(results)
    })
}

exports.findOne = (req, res) => {
    const id = req.params.id

    SupportMessage.findById(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to retrieve support message" })
        }
        if (!result) {
            return res.status(404).json({ message: "Support message not found" })
        }
        res.status(200).json(result)
    })
}

exports.update = (req, res) => {
    const id = req.params.id
    const { sender_id, receiver_id, receiver_type, message, type, media_url } = req.body

    if (!sender_id || !receiver_id || !message) {
        return res.status(400).json({ message: "Missing required parameters" })
    }

    SupportMessage.update(id, { sender_id, receiver_id, receiver_type, message, type, media_url }, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to update support message" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Support message not found" })
        }
        res.status(200).json({ message: "Support message updated successfully" })
    })
}

exports.delete = (req, res) => {
    const id = req.params.id

    SupportMessage.delete(id, (err, result) => {
        if (err) {
            console.error(err)
            return res.status(500).json({ message: "Failed to delete support message" })
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Support message not found" })
        }
        res.status(200).json({ message: "Support message deleted successfully" })
    })
}

