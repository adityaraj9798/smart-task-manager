const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

/**
 * TEMP SIMPLE LOGIN
 * (no DB user model yet – enough for precision demo)
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // simple hardcoded user (like demo accounts)
  if (email !== "test@test.com" || password !== "123456") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: "000000000000000000000000" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

module.exports = router;
