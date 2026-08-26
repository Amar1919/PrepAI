const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { signup, login, forgotPassword, resetPassword } = require("./authController");
const validate = require("../../shared/middleware/validate");

router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  signup
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email is required")],
  validate,
  forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  resetPassword
);

module.exports = router;