require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

console.log("Testing with user:", process.env.EMAIL_USER);
console.log("Password length:", process.env.EMAIL_APP_PASSWORD?.length, "(should be 16)");

transporter.verify((error, success) => {
  if (error) {
    console.log("VERIFY FAILED:", error.message);
  } else {
    console.log("VERIFY SUCCESS");
  }
});