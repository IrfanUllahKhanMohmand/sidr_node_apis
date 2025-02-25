const db = require("../config/db")

exports.create = (message, callback) => {
    const sql = `
    INSERT INTO frequent_support_messages 
    (id, message) 
    VALUES (?, ?)
  `

    db.query(sql, [message.id, message.message], callback)
}

exports.findAll = (callback) => {
    const sql = `SELECT * FROM frequent_support_messages`

    db.query(sql, callback)
}

exports.findById = (id, callback) => {
    const sql = `SELECT * FROM frequent_support_messages WHERE id = ?`

    db.query(sql, [id], callback)
}

exports.update = (id, message, callback) => {
    const sql = `
    UPDATE frequent_support_messages 
    SET message = ? 
    WHERE id = ?
  `

    db.query(sql, [message.message, id], callback)
}

exports.delete = (id, callback) => {
    const sql = `DELETE FROM frequent_support_messages WHERE id = ?`

    db.query(sql, [id], callback)
}

