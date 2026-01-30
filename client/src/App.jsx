import { useEffect, useRef, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const inputRef = useRef(null);

  // Persisted UI
  const [filter, setFilter] = useState(localStorage.getItem("filter") || "all");
  const [dark, setDark] = useState(localStorage.getItem("dark") !== "false");

  // New features
  const [focusMode, setFocusMode] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);

  /* ================= AI ANALYSIS ================= */
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

  /* ================= Persist ================= */
  useEffect(() => {
    localStorage.setItem("dark", dark);
    localStorage.setItem("filter", filter);
  }, [dark, filter]);

  /* ================= Fetch ================= */
  const fetchTasks = async () => {
    const res = await fetch("http://localhost:5001/api/tasks/all");
    const data = await res.json();
    setTasks(data.tasks || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  /* ================= AI Thinking ================= */
  useEffect(() => {
    if (!title) {
      setAiThinking(false);
      return;
    }
    setAiThinking(true);
    const t = setTimeout(() => setAiThinking(false), 700);
    return () => clearTimeout(t);
  }, [title]);

  /* ================= CRUD ================= */
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

  const toggleComplete = async (id) => {
    await fetch(`http://localhost:5001/api/tasks/${id}/complete`, {
      method: "PATCH",
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5001/api/tasks/${id}`, {
      method: "DELETE",
    });
    fetchTasks();
  };

  /* ================= Filter ================= */
  let visibleTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  /* ================= Focus Mode ================= */
  if (focusMode && visibleTasks.length > 0) {
    visibleTasks = [
      [...visibleTasks].sort(
        (a, b) => analyzeTask(b.title).score - analyzeTask(a.title).score
      )[0],
    ];
  }

  /* ================= Analytics ================= */
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  const highPriority = tasks.filter(
    (t) => analyzeTask(t.title).priority === "high"
  ).length;

  const percent = total ? Math.round((completed / total) * 100) : 0;

  /* ================= Theme ================= */
  const bg = dark
    ? "linear-gradient(135deg,#020617,#0f172a)"
    : "#f8fafc";

  const glass = dark
    ? "rgba(15,23,42,0.6)"
    : "rgba(255,255,255,0.6)";

  const text = dark ? "#e5e7eb" : "#020617";

  const priorityColor = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bg,
        color: text,
        padding: "40px 12px",
        fontFamily: "Inter, Arial",
      }}
    >
      <style>
        {`
          .glass {
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(255,255,255,0.08);
          }
          .task-card {
            transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.3s ease;
          }
          .task-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          }
          button:active {
            transform: scale(0.95);
          }
        `}
      </style>

      <div
        className="glass"
        style={{
          maxWidth: "540px",
          margin: "auto",
          background: glass,
          borderRadius: "18px",
          padding: "22px",
          boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
        }}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>🤖 AI Task Manager</h2>
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={() => setFocusMode(!focusMode)}>
              🎯
            </button>
            <button onClick={() => setDark(!dark)}>
              {dark ? "🌞" : "🌙"}
            </button>
          </div>
        </div>

        {/* ANALYTICS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: "8px",
            margin: "14px 0",
          }}
        >
          {[
            ["Total", total],
            ["Done", completed],
            ["Pending", pending],
            ["High", highPriority],
          ].map(([label, value]) => (
            <div
              key={label}
              className="glass"
              style={{
                padding: "8px",
                borderRadius: "12px",
                textAlign: "center",
              }}
            >
              <b style={{ color: label === "High" ? "#ef4444" : text }}>
                {value}
              </b>
              <div style={{ fontSize: "11px", opacity: 0.7 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS */}
        <div
          style={{
            height: "8px",
            background: "rgba(255,255,255,0.12)",
            borderRadius: "999px",
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              background: "#4f46e5",
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* ADD */}
        <form onSubmit={addTask}>
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type task… AI will analyze"
            className="glass"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              marginBottom: "6px",
              background: glass,
              color: text,
              outline: "none",
            }}
          />
          {title && (
            <p style={{ fontSize: "13px", opacity: 0.8 }}>
              {aiThinking
                ? "🧠 AI analyzing…"
                : `🤖 Score ${aiPreview.score}/100 — ${aiPreview.reason}`}
            </p>
          )}
        </form>

        {/* FILTER */}
        <div style={{ display: "flex", gap: "6px", margin: "14px 0" }}>
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="glass"
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "10px",
                border: "none",
                color: text,
                background:
                  filter === f ? "rgba(79,70,229,0.8)" : glass,
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* TASKS */}
        {visibleTasks.map((task) => {
          const ai = analyzeTask(task.title);
          return (
            <div
              key={task._id}
              className="task-card glass"
              style={{
                padding: "14px",
                borderRadius: "14px",
                marginBottom: "10px",
                borderLeft: `6px solid ${priorityColor[ai.priority]}`,
                opacity: task.completed ? 0.6 : 1,
              }}
            >
              <strong
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.title}
              </strong>

              <p style={{ fontSize: "12px", opacity: 0.7 }}>
                🤖 {ai.score}/100 — {ai.reason}
              </p>

              <div style={{ display: "flex", gap: "6px" }}>
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
