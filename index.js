const express = require("express");

const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const charityPageRoutes = require("./routes/charityPagesRoutes");
const messageRoutes = require("./routes/messageRoutes");

require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Routes
app.use(userRoutes);
app.use(postRoutes);
app.use(charityPageRoutes);
app.use(messageRoutes);

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
