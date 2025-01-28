const express = require("express");

const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const charityPageRoutes = require("./routes/charityPagesRoutes");
const messageRoutes = require("./routes/messageRoutes");
const donationRoutes = require("./routes/donationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const fcmTokenRoutes = require("./routes/fcmRoutes");
const tokenGenerateRoute = require("./routes/tokenGenerateRoute");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

//Add status of the user profile
//Update status of the user profile

// Routes
app.use(userRoutes);
app.use(postRoutes);
app.use(charityPageRoutes);
app.use(messageRoutes);
app.use(donationRoutes);
app.use(reportRoutes);
app.use(fcmTokenRoutes);
app.use(tokenGenerateRoute);

const PORT = 80;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
