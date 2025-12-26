const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

// Protected route
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    userId: req.user.id,
  });
});

module.exports = router;
