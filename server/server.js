const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const taskRoutes = require("./routes/taskRoutes");

const app = express();

/* 🔥 REQUIRED MIDDLEWARES */
app.use(cors());                 // <<< THIS FIXES IT
app.use(express.json());         // <<< REQUIRED FOR req.body

app.get("/", (req, res) => {
  res.send("Smart Task Manager API running 🚀");
});

app.use("/api/tasks", taskRoutes);

const PORT = 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected ✅");
    app.listen(PORT, () => {
      console.log("Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });
