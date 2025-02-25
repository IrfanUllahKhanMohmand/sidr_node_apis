const db = require("../config/db")

exports.create = (id, faq, callback) => {
    const sql = `
    INSERT INTO faqs 
    (id,question, answer) 
    VALUES (?, ?,?)
  `

    db.query(sql, [faq.question, faq.answer], callback)
}

exports.findAll = (callback) => {
    const sql = `SELECT * FROM faqs`

    db.query(sql, callback)
}

exports.findById = (id, callback) => {
    const sql = `SELECT * FROM faqs WHERE id = ?`

    db.query(sql, [id], callback)
}

exports.update = (id, faq, callback) => {
    const sql = `
    UPDATE faqs 
    SET question = ?, answer = ? 
    WHERE id = ?
  `

    db.query(sql, [faq.question, faq.answer, id], callback)
}

exports.delete = (id, callback) => {
    const sql = `DELETE FROM faqs WHERE id = ?`

    db.query(sql, [id], callback)
}

