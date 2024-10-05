const express = require("express");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const { upload } = require("./common/imageUploader");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

require("dotenv").config();

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const app = express();
app.use(bodyParser.json());

// Routes
app.use(userRoutes);
app.use(postRoutes);

app.post("/verifyToken", async (req, res) => {
  const idToken = req.body.idToken;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    res.status(200).send({ uid: decodedToken.uid });
  } catch (error) {
    res.status(401).send({ error: "Invalid token" });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
