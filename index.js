const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./config/db.js");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const charityPageRoutes = require("./routes/charityPagesRoutes");
const messageRoutes = require("./routes/messageRoutes");
const donationRoutes = require("./routes/donationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const fcmTokenRoutes = require("./routes/fcmRoutes");
const tokenGenerateRoute = require("./routes/tokenGenerateRoute");
const feedbackRoutes = require("./routes/feedbackRoutes");
const supportMessageRoutes = require("./routes/supportMessageRoutes");
const frequentSupportMessageRoutes = require("./routes/frequentSupportMessageRoutes");
const faqRoutes = require("./routes/faqRoutes");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use(userRoutes);
app.use(postRoutes);
app.use(charityPageRoutes);
app.use(messageRoutes);
app.use(donationRoutes);
app.use(reportRoutes);
app.use(fcmTokenRoutes);
app.use(tokenGenerateRoute);
app.use(feedbackRoutes);
app.use(supportMessageRoutes);
app.use(frequentSupportMessageRoutes);
app.use(faqRoutes);

// Start Node.js app on a different port (e.g., 3000)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Node.js app running on port ${PORT}`);
});
