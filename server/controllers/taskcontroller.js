const Task = require("../models/task");

// GET ALL TASKS
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ text: req.body.text });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// THE DUE DATE FIX: General Update function
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // We use $set to ensure the dueDate (or any other field) is overwritten
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true } // Returns the updated document
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= STATUS TOGGLES ================= */
exports.toggleTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.completed = !task.completed;
  await task.save();
  res.json(task);
};

exports.toggleImportant = async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.important = !task.important;
  await task.save();
  res.json(task);
};

exports.toggleMyDay = async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.myDay = !task.myDay;
  await task.save();
  res.json(task);
};

/* ================= SUBTASK LOGIC ================= */
exports.addSubtask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.subtasks.push({ text: req.body.text, completed: false });
  await task.save();
  res.json(task);
};

exports.toggleSubtask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  const sub = task.subtasks.id(req.params.subId);
  sub.completed = !sub.completed;
  await task.save();
  res.json(task);
};

exports.deleteSubtask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  task.subtasks.pull({ _id: req.params.subId });
  await task.save();
  res.json(task);
};