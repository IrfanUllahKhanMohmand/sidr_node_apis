const express = require("express");

const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const charityPageRoutes = require("./routes/charityPagesRoutes");
const messageRoutes = require("./routes/messageRoutes");
const donationRoutes = require("./routes/donationRoutes");
const reportRoutes = require("./routes/reportRoutes");

require("dotenv").config();

const app = express();
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

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
