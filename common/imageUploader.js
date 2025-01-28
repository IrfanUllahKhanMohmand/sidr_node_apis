const aws = require("aws-sdk");
const multerS3 = require("multer-s3");
const multer = require("multer");
const dotenv = require("dotenv");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
dotenv.config();

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});
const s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    acl: "public-read",
    bucket: "sidrappbucketnew",
    key: function (req, file, cb) {
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueFilename);
    },
  }),
});

exports.upload = upload;
