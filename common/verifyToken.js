const admin = require("firebase-admin");
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const User = require("../models/User");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if the Authorization header is present
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({ error: "Authorization header is required" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  // Check if idToken is provided
  if (!idToken) {
    return res.status(400).json({ error: "idToken is required" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      const uid = decodedToken.uid;

      User.doesUserExist(uid, (error, userExists) => {
        if (error) {
          console.error("Database error:", error);
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!userExists) {
          return res.status(404).json({ error: "User not found" });
        }

        // Attach user information to request object
        req.currentUid = uid;
        next(); // Call next() to proceed to the next middleware/route handler
      });
    })
    .catch((error) => {
      console.error("Token verification error:", error);
      res.status(401).json({
        error: "Invalid token",
        details: error.message,
      });
    });
};

module.exports = { verifyToken };
