const db = require("../config/db");
const crypto = require("crypto");

const CharityPage = {
  createPage: (pageData, callback) => {
    const id = crypto.randomBytes(16).toString("hex");
    const query = `
            INSERT INTO charity_pages (id, name, location,profile_image,cover_image, front_image, back_image, description, userId)
            VALUES (?, ?, ?, ?, ?, ?, ?,?,?)
        `;
    const values = [
      id,
      pageData.name,
      pageData.location,
      pageData.profile_image,
      pageData.cover_image,
      pageData.front_image,
      pageData.back_image,
      pageData.description,
      pageData.userId,
    ];
    db.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id, ...pageData });
      }
    });
  },

  updatePage: (pageId, pageData, callback) => {
    const updates = [];
    const values = [];

    if (pageData.name) {
      updates.push("name = ?");
      values.push(pageData.name);
    }
    if (pageData.location) {
      updates.push("location = ?");
      values.push(pageData.location);
    }
    if (pageData.description) {
      updates.push("description = ?");
      values.push(pageData.description);
    }

    if (pageData.profile_image) {
      updates.push("profile_image = ?");
      values.push(pageData.profile_image);
    }

    if (pageData.cover_image) {
      updates.push("cover_image = ?");
      values.push(pageData.cover_image);
    }

    if (pageData.front_image) {
      updates.push("front_image = ?");
      values.push(pageData.front_image);
    }

    if (pageData.back_image) {
      updates.push("back_image = ?");
      values.push(pageData.back_image);
    }

    if (updates.length === 0) {
      return callback(null, { message: "No fields to update." });
    }

    const query = `UPDATE charity_pages SET ${updates.join(", ")} WHERE id = ?`;
    values.push(pageId);

    db.query(query, values, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { id: pageId, ...pageData });
      }
    });
  },

  updatePageStatus: (pageId, pageStatus, callback) => {
    const query = `UPDATE charity_pages SET status = ? WHERE id = ?`;
    db.query(query, [pageStatus, pageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { message: "Charity page status updated successfully" });
      }
    });
  },

  deletePage: (pageId, callback) => {
    const query = "DELETE FROM charity_pages WHERE id = ?";
    db.query(query, [pageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, { message: "Charity page deleted successfully" });
      }
    });
  },

  getPageById: (pageId, callback) => {
    const query = "SELECT * FROM charity_pages WHERE id = ?";
    db.query(query, [pageId], (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, result[0]);
      }
    });
  },

  getPagesByUserId: (
    { userId, page, pageSize, search, isInactive },
    callback
  ) => {
    const offset = (page - 1) * pageSize;
    const queryParams = [userId];
    let conditions = [
      "charity_pages.userId = ?",
      isInactive !== null && isInactive !== "false"
        ? "charity_pages.status = 'inactive'"
        : "charity_pages.status = 'active'",
    ];

    if (search) {
      conditions.push(
        "(charity_pages.name LIKE ? OR charity_pages.description LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    const query = `
    SELECT 
      charity_pages.id AS charity_id,
      charity_pages.name AS charity_name,
      charity_pages.description AS charity_description,
      charity_pages.status AS charity_status,
      charity_pages.createdAt AS charity_createdAt,
      charity_pages.location AS charity_location,
      charity_pages.profile_image AS charity_profile_image,
      charity_pages.cover_image AS charity_cover_image,
      charity_pages.front_image AS charity_front_image,
      charity_pages.back_image AS charity_back_image,
      
      users.id AS user_id,
      users.name AS user_name,
      users.email AS user_email,
      users.profile_image AS user_profile_image,

      CASE WHEN follows.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS isFollower
    FROM charity_pages
    LEFT JOIN users ON charity_pages.userId = users.id
    LEFT JOIN follows ON charity_pages.id = follows.charity_page_id AND follows.user_id = ?
    WHERE ${conditions.join(" AND ")}
    ORDER BY charity_pages.createdAt DESC
    LIMIT ? OFFSET ?
  `;

    queryParams.push(userId, pageSize, offset);

    db.query(query, queryParams, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        const formattedResult = result.map((row) => ({
          charityPage: {
            id: row.charity_id,
            name: row.charity_name,
            description: row.charity_description,
            status: row.charity_status,
            createdAt: row.charity_createdAt,
            location: row.charity_location,
            profile_image: row.charity_profile_image,
            cover_image: row.charity_cover_image,
            front_image: row.charity_front_image,
            back_image: row.charity_back_image,
          },
          user: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            profile_image: row.user_profile_image,
          },
          isFollower: row.isFollower === 1, // Ensure `isFollower` returns as a boolean
        }));
        callback(null, formattedResult);
      }
    });
  },

  getPages: ({ page, pageSize, search, excludeId, isInactive }, callback) => {
    const offset = (page - 1) * pageSize;
    const queryParams = [];

    // Determine the status condition based on isInactive flag
    let conditions = [
      isInactive !== null && isInactive !== "false"
        ? "charity_pages.status = 'inactive'"
        : "charity_pages.status = 'active'",
    ];

    // Exclude specific user ID from charity pages
    if (excludeId) {
      conditions.push("charity_pages.userId != ?");
      queryParams.push(excludeId);
    }

    // Add search filter for name or description if provided
    if (search) {
      conditions.push(
        "(charity_pages.name LIKE ? OR charity_pages.description LIKE ?)"
      );
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Construct SQL query with `isFollower` field
    const query = `
    SELECT 
      charity_pages.id AS charity_id, 
      charity_pages.userId AS charity_userId,
      charity_pages.name AS charity_name, 
      charity_pages.description AS charity_description, 
      charity_pages.status AS charity_status, 
      charity_pages.createdAt AS charity_createdAt, 
      charity_pages.location AS charity_location, 
      charity_pages.profile_image AS charity_profile_image,
      charity_pages.cover_image AS charity_cover_image,
      charity_pages.front_image AS charity_front_image,
      charity_pages.back_image AS charity_back_image,
      users.id AS user_id, 
      users.name AS user_name, 
      users.email AS user_email, 
      users.profile_image AS user_profile_image,
      CASE WHEN follows.user_id IS NOT NULL THEN true ELSE false END AS isFollower
    FROM charity_pages
    LEFT JOIN users ON charity_pages.userId = users.id
    LEFT JOIN follows ON charity_pages.id = follows.charity_page_id AND follows.user_id = ?
    WHERE ${conditions.join(" AND ")}
    ORDER BY charity_pages.createdAt DESC
    LIMIT ? OFFSET ?
  `;

    // Add parameters for follows.user_id, pageSize, and offset
    queryParams.push(excludeId, pageSize, offset);

    // Execute query and handle results
    db.query(query, queryParams, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        // Format the result to include the `isFollower` field
        const formattedResult = result.map((row) => ({
          charityPage: {
            id: row.charity_id,
            userId: row.charity_userId,
            name: row.charity_name,
            description: row.charity_description,
            status: row.charity_status,
            createdAt: row.charity_createdAt,
            location: row.charity_location,
            profile_image: row.charity_profile_image,
            cover_image: row.charity_cover_image,
            front_image: row.charity_front_image,
            back_image: row.charity_back_image,
          },
          user: {
            id: row.user_id,
            name: row.user_name,
            email: row.user_email,
            profile_image: row.user_profile_image,
          },
          isFollower: row.isFollower === 1,
        }));

        callback(null, formattedResult);
      }
    });
  },

  followPage: (userId, charityPageId, callback) => {
    const query = `
      INSERT INTO follows (user_id, charity_page_id) 
      VALUES (?, ?)
    `;
    db.query(query, [userId, charityPageId], (err, result) => {
      if (err) callback(err, null);
      else callback(null, { message: "Page followed successfully" });
    });
  },

  unfollowPage: (userId, charityPageId, callback) => {
    const query = `
      DELETE FROM follows 
      WHERE user_id = ? AND charity_page_id = ?
    `;
    db.query(query, [userId, charityPageId], (err, result) => {
      if (err) callback(err, null);
      else callback(null, { message: "Page unfollowed successfully" });
    });
  },

  getCharityPageFollowers: (pageId, callback) => {
    const query = `
      SELECT users.id, users.name, users.profile_image
      FROM users
      JOIN follows ON users.id = follows.user_id
      WHERE follows.charity_page_id = ?
    `;
    db.query(query, [pageId], (err, result) => {
      if (err) callback(err, null);
      else callback(null, result);
    });
  },

  // Get all charity pages that a user follows
  getFollowedPages: (userId, callback) => {
    const query = `
      SELECT charity_pages.id, charity_pages.name, charity_pages.description, charity_pages.profile_image
      FROM charity_pages
      JOIN follows ON charity_pages.id = follows.charity_page_id
      WHERE follows.user_id = ?
    `;
    db.query(query, [userId], (err, result) => {
      if (err) callback(err, null);
      else callback(null, result);
    });
  },
};

module.exports = CharityPage;
