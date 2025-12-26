import { useEffect, useState } from "react";
import API from "../services/api";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);

  // FETCH TASKS
  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ADD TASK
  const handleAddTask = async () => {
    if (!title.trim()) return;

    try {
      const res = await API.post("/tasks", { title });
      setTasks([...tasks, res.data]);
      setTitle("");
    } catch (err) {
      console.error("Add error", err.response?.data || err);
      alert("Failed to add task");
    }
  };

  return (
    <div style={{ padding: 40, color: "white" }}>
      <h1>Dashboard</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add task"
      />

      <button onClick={handleAddTask}>Add</button>

      <h3>Your Tasks</h3>
      {tasks.length === 0 && <p>No tasks found</p>}

      {tasks.map((task) => (
        <div key={task._id}>{task.title}</div>
      ))}
    </div>
  );
}
