const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

router.post("/add", async (req, res) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({ success: false });
    }

    const task = new Task({
      title: req.body.title,
      completed: false,
    });

    await task.save();
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.get("/all", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json({ success: true, tasks });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.patch("/:id/complete", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false });
    }
    task.completed = !task.completed;
    await task.save();
    res.json({ success: true, task });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
