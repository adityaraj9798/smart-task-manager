const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Basic CRUD
router.get("/", taskController.getTasks);
router.post("/", taskController.createTask);
router.delete("/:id", taskController.deleteTask);

// General Update (IMPORTANT: Handles Category, Priority, Due Date, and Notes)
router.patch("/:id", taskController.updateTask);

// Status Toggles
router.patch("/:id/toggle", taskController.toggleTask);
router.patch("/:id/important", taskController.toggleImportant);
router.patch("/:id/myday", taskController.toggleMyDay);

// Subtasks
router.post("/:id/subtasks", taskController.addSubtask);
router.patch("/:id/subtasks/:subId", taskController.toggleSubtask);
router.delete("/:id/subtasks/:subId", taskController.deleteSubtask);

module.exports = router;