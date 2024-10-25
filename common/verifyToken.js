const admin = require("firebase-admin");
const axios = require("axios");
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firebaseConfig = {
  apiKey: "AIzaSyCRSGRAICirftPG05ZOm_JyFDMM2VuKKiA",
  authDomain: "sidrapp-2ef3e.firebaseio.com",
};

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

const createToken = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({
      email: "Email is required",
      password: "Password is required",
    });
  }
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    const idToken = response.data.idToken;
    // You can now use the idToken to authenticate the user on your server
    res.status(200).json({ message: "User logged in successfully", idToken });
  } catch (error) {
    console.error("Error logging in:", error);
    if (error.response) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = { verifyToken, createToken };
