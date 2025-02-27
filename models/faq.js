// Updated FAQ Model
const db = require("../config/db")

exports.createFaq = (faqData, callback) => {
    const { id, question, answer } = faqData;
    const sql = "INSERT INTO faqs (id, question, answer) VALUES (?, ?, ?)"

    db.query(sql, [id, question, answer], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
}

exports.findAll = (callback) => {
    const sql = `SELECT * FROM faqs`
    db.query(sql, (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
}

exports.findById = (id, callback) => {
    const sql = `SELECT * FROM faqs WHERE id = ?`
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
}

exports.update = (id, faq, callback) => {
    const sql = `UPDATE faqs SET question = ?, answer = ? WHERE id = ?`
    db.query(sql, [faq.question, faq.answer, id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
}

exports.delete = (id, callback) => {
    const sql = `DELETE FROM faqs WHERE id = ?`
    db.query(sql, [id], (err, result) => {
        if (err) return callback(err);
        callback(null, result);
    });
}