import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchTasks = async () => {
    const res = await API.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await API.post("/tasks", { title });
    setTasks([...tasks, res.data]);
    setTitle("");
  };

  const toggleComplete = async (id, completed) => {
    const res = await API.put(`/tasks/${id}`, {
      completed: !completed,
    });
    setTasks(tasks.map(t => t._id === id ? res.data : t));
  };

  const deleteTask = async (id) => {
    await API.delete(`/tasks/${id}`);
    setTasks(tasks.filter(t => t._id !== id));
  };

  return (
    <div className="dashboard">
      <button className="logout" onClick={handleLogout}>Logout</button>
      <h1>My Tasks</h1>

      <div className="add-task">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add new task"
        />
        <button onClick={addTask}>Add</button>
      </div>

      {tasks.map(task => (
        <div key={task._id} className="task">
          <span
            className={task.completed ? "completed" : ""}
            onClick={() => toggleComplete(task._id, task.completed)}
            style={{ cursor: "pointer" }}
          >
            {task.title}
          </span>
          <button onClick={() => deleteTask(task._id)}>❌</button>
        </div>
      ))}
    </div>
  );
}
