const admin = require("firebase-admin");
const axios = require("axios");
const dotenv = require("dotenv");
var serviceAccount = require("../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASRE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
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


//Set Admin
const setAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    // Get user details by email
    const user = await admin.auth().getUserByEmail(email);

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });

    res.status(200).json({ message: `User with email ${email} is now an admin` });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// remove admin
const removeAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    // Get user details by email
    const user = await admin.auth().getUserByEmail(email);

    // Remove admin custom claim
    await admin.auth().setCustomUserClaims(user.uid, { admin: false });

    res.status(200).json({ message: `User with email ${email} is no longer an admin` });
  } catch (error) {
    res.status(500).json({ error });
  }
};


//is admin
const isAdmin = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);
    const isAdmin = user.customClaims?.admin || false;

    res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(500).json({ error });
  }
};



//List all users in firebase auth
const listAllUsers = async (req, res) => {
  try {
    const listUsers = await admin.auth().listUsers();
    const users = listUsers.users.map((user) => {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        metadata: user.metadata,
      };
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Enable a user in firebase auth
const enableUser = async (req, res) => {
  const { uid } = req.body;
  try {
    await admin.auth().updateUser(uid, {
      disabled: false,
    });
    res.status(200).json({ message: "User enabled successfully" });
  } catch (error) {
    console.error("Error enabling user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Disable a user in firebase auth
const disableUser = async (req, res) => {
  const { uid } = req.body;
  try {
    await admin.auth().updateUser(uid, {
      disabled: true,
    });
    res.status(200).json({ message: "User disabled successfully" });
  } catch (error) {
    console.error("Error disabling user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
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

    // Verify Firebase token to get user data
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const user = await admin.auth().getUser(decodedToken.uid);
    const isAdmin = user.customClaims?.admin || false;

    res.status(200).json({ message: "User logged in successfully", idToken, isAdmin });
  } catch (error) {
    console.error("Error logging in:", error);
    if (error.response) {
      res.status(401).json({ message: "Invalid email or password" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};



const sendEmailVerification = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    // 1. Get the user by email
    const userRecord = await admin.auth().getUserByEmail(email)

    // 2. Create a custom token for this user
    const customToken = await admin.auth().createCustomToken(userRecord.uid)

    // 3. Exchange custom token for ID token
    const tokenResponse = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseConfig.apiKey}`,
      {
        token: customToken,
        returnSecureToken: true,
      },
    )

    const idToken = tokenResponse.data.idToken

    // 4. Send verification email using the ID token
    await axios.post(`https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`, {
      requestType: "VERIFY_EMAIL",
      idToken: idToken,
    })

    res.status(200).json({
      success: true,
      message: "Email verification sent successfully",
    })
  } catch (error) {
    console.error("Error sending verification email:", error)

    // Handle specific Firebase Admin errors
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided email",
      })
    } else if (error.response) {
      // Handle REST API errors
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data.error.message || "Failed to send verification email",
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }
}

const isEmailVerified = async (req, res) => {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: "Email is required" })
  }

  try {
    // Get the user by email using Firebase Admin SDK
    const userRecord = await admin.auth().getUserByEmail(email)

    // Check if the email is verified
    const emailVerified = userRecord.emailVerified

    res.status(200).json({
      success: true,
      emailVerified,
    })
  } catch (error) {
    console.error("Error checking email verification:", error)

    // Handle specific Firebase Admin errors
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided email",
      })
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      })
    }
  }
}






//verify oobCode
const verifyEmailCode = async (req, res) => {
  const { oobCode } = req.body;
  try {
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`,
      {
        oobCode,
      }
    );

    const emailVerified = response.data.users[0].emailVerified;
    // You can now use the idToken to authenticate the user on your server
    res.status(200).json({ emailVerified });
  } catch (error) {
    console.error("Error verifying email:", error);
    if (error.response) {
      res.status(401).json({ message: "Invalid email" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};


//Send password reset email
const sendPasswordResetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${firebaseConfig.apiKey}`,
      {
        email,
        requestType: "PASSWORD_RESET",
      }
    );

    res.status(200).json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    if (error.response) {
      res.status(401).json({ message: "Invalid email" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};


//Reset password
const resetPassword = async (req, res) => {
  const { oobCode, newPassword } = req.body;
  try {
    await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=${firebaseConfig.apiKey}`,
      {
        oobCode,
        newPassword,
      }
    );

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.response) {
      res.status(401).json({ message: "Invalid oobCode" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

module.exports = {
  verifyToken,
  createToken,
  listAllUsers,
  enableUser,
  disableUser,
  sendEmailVerification,
  verifyEmailCode,
  sendPasswordResetEmail,
  resetPassword,
  isEmailVerified,
  setAdmin,
  removeAdmin,
  isAdmin
};
