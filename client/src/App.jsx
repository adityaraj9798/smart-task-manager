import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [dark, setDark] = useState(true);

  // ================= AI ANALYSIS =================
  const analyzeTask = (text) => {
    const t = text.toLowerCase();
    let score = 10;
    let reason = "No urgency detected";

    if (t.includes("urgent") || t.includes("asap") || t.includes("deadline") || t.includes("today")) {
      score += 50;
      reason = "Critical urgency keyword detected";
    } else if (t.includes("exam") || t.includes("assignment") || t.includes("important")) {
      score += 35;
      reason = "Important academic/work task";
    } else if (t.includes("tomorrow") || t.includes("soon")) {
      score += 20;
      reason = "Time-sensitive task";
    }

    if (score > 100) score = 100;

    let priority = "low";
    if (score >= 70) priority = "high";
    else if (score >= 40) priority = "medium";

    return { priority, score, reason };
  };

  const aiPreview = title ? analyzeTask(title) : null;

  // ================= FETCH =================
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5001/api/tasks/all");
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ================= ADD =================
  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    await fetch("http://localhost:5001/api/tasks/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    setTitle("");
    fetchTasks();
  };

  // ================= TOGGLE =================
  const toggleComplete = async (id) => {
    await fetch(`http://localhost:5001/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
    fetchTasks();
  };

  // ================= DELETE =================
  const deleteTask = async (id) => {
    await fetch(`http://localhost:5001/api/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  // ================= FILTER =================
  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  // ================= PROGRESS =================
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  // ================= THEME =================
  const bg = dark ? "#0f172a" : "#f8fafc";
  const card = dark ? "#020617" : "#ffffff";
  const text = dark ? "#e5e7eb" : "#020617";

  const priorityColor = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, padding: "40px 12px", fontFamily: "Inter, Arial" }}>
      <div style={{ maxWidth: "520px", margin: "auto", background: card, borderRadius: "16px", padding: "22px", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>🤖 AI Task Manager</h2>
          <button onClick={() => setDark(!dark)}>{dark ? "🌞" : "🌙"}</button>
        </div>

        {/* PROGRESS */}
        <p style={{ opacity: 0.7 }}>{completed} / {total} completed</p>
        <div style={{ height: "8px", background: dark ? "#020617" : "#e5e7eb", borderRadius: "999px", overflow: "hidden", marginBottom: "14px" }}>
          <div style={{ width: `${percent}%`, height: "100%", background: "#4f46e5", transition: "0.4s" }} />
        </div>

        {/* ADD */}
        <form onSubmit={addTask}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type task… AI will score urgency"
            style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", marginBottom: "6px", background: dark ? "#020617" : "#f1f5f9", color: text }}
          />

          {aiPreview && (
            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              🧠 Urgency Score: <b>{aiPreview.score}/100</b> — {aiPreview.reason}
            </p>
          )}
        </form>

        {/* FILTER */}
        <div style={{ display: "flex", gap: "6px", margin: "14px 0" }}>
          {["all", "pending", "completed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ flex: 1, padding: "8px", borderRadius: "10px", border: "none", background: filter === f ? "#4f46e5" : "#020617", color: "#fff" }}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TASKS */}
        {filteredTasks.map((task) => {
          const ai = analyzeTask(task.title);

          return (
            <div key={task._id} style={{ background: dark ? "#020617" : "#f9fafb", padding: "14px", borderRadius: "14px", marginBottom: "10px", borderLeft: `6px solid ${priorityColor[ai.priority]}`, opacity: task.completed ? 0.6 : 1 }}>
              <strong style={{ textDecoration: task.completed ? "line-through" : "none" }}>{task.title}</strong>
              <p style={{ fontSize: "12px", opacity: 0.7 }}>🤖 Score {ai.score}/100 — {ai.reason}</p>
              <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                <button onClick={() => toggleComplete(task._id)}>✓</button>
                <button onClick={() => deleteTask(task._id)}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
