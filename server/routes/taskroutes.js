const express = require("express");
const router = express.Router();

const {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} = require("../controllers/taskcontroller");

const authMiddleware = require("../middleware/authMiddleware");

// GET all tasks
router.get("/", authMiddleware, getTasks);

// CREATE task
router.post("/", authMiddleware, createTask);

// UPDATE task (✅ THIS WAS BREAKING)
router.put("/:id", authMiddleware, updateTask);

// DELETE task
router.delete("/:id", authMiddleware, deleteTask);

module.exports = router;
