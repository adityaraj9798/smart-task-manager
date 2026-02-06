const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    completed: { type: Boolean, default: false },
    important: { type: Boolean, default: false },
    myDay: { type: Boolean, default: false },
    dueDate: { type: Date, default: null }, // CRITICAL: Must be Date type
    priority: { type: String, default: null },
    category: { type: String, default: null },
    notes: { type: String, default: "" },
    subtasks: [
      {
        text: String,
        completed: { type: Boolean, default: false },
      },
    ],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);