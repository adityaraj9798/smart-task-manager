import { useEffect, useState } from "react";
import {
  fetchTasks,
  addTask,
  deleteTask,
  toggleImportant,
  toggleMyDay,
  setDueDate,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateTaskNotes,
} from "../services/taskApi";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("Tasks");
  const [search, setSearch] = useState("");
  const [taskText, setTaskText] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [detailText, setDetailText] = useState("");
  const [notes, setNotes] = useState("");

  const [deleteItem, setDeleteItem] = useState(null);

  const [layout, setLayout] = useState(
    localStorage.getItem("layout") || "list"
  );

  /* ================= LOAD TASKS ================= */
  useEffect(() => {
    fetchTasks()
      .then((res) => setTasks(res.data || []))
      .catch(() => setTasks([]));
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  /* ================= ADD TASK ================= */
  const handleAdd = async () => {
    if (!taskText.trim()) return;
    const res = await addTask(taskText.trim());
    setTasks([res.data, ...tasks]);
    setTaskText("");
  };

  const updateTask = (updated) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
  };

  /* ================= DELETE + UNDO ================= */
  const handleDelete = (task) => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    setDeleteItem(task);
    setSelectedTask(null);

    setTimeout(async () => {
      if (deleteItem?._id === task._id) {
        await deleteTask(task._id);
        setDeleteItem(null);
      }
    }, 4000);
  };

  const undoDelete = () => {
    if (!deleteItem) return;
    setTasks((prev) => [deleteItem, ...prev]);
    setDeleteItem(null);
  };

  /* ================= FILTER ================= */
  let visible = tasks.filter(
    (t) =>
      t?.text &&
      t.text.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "Important") visible = visible.filter((t) => t.important);
  if (view === "My Day") visible = visible.filter((t) => t.myDay);
  if (view === "Planned") visible = visible.filter((t) => t.dueDate);

  return (
    <div className="h-screen flex bg-[#f5f6f8]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r">
        <div className="px-6 py-4 text-xl font-semibold text-blue-600">
          To Do
        </div>
        {["My Day", "Important", "Planned", "Tasks"].map((item) => (
          <div
            key={item}
            onClick={() => setView(item)}
            className={`mx-3 my-1 px-4 py-2 rounded cursor-pointer ${
              view === item
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col relative">
        {/* TOP BAR */}
        <div className="h-14 bg-white border-b flex items-center gap-3 px-6">
          <h1 className="text-lg font-semibold flex-1">{view}</h1>

          <button
            onClick={() => {
              setLayout("list");
              localStorage.setItem("layout", "list");
            }}
            className={layout === "list" ? "font-semibold" : ""}
          >
            List
          </button>

          <button
            onClick={() => {
              setLayout("grid");
              localStorage.setItem("layout", "grid");
            }}
            className={layout === "grid" ? "font-semibold" : ""}
          >
            Grid
          </button>

          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />

          <button
            onClick={handleLogout}
            className="text-sm text-red-500"
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto px-8 py-6">
          {/* ADD TASK */}
          {view === "Tasks" && (
            <div className="bg-white p-4 rounded shadow mb-6">
              <input
                placeholder="Add a task"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full outline-none"
              />
            </div>
          )}

          {/* TASK LIST / GRID */}
          <div
            className={
              layout === "grid"
                ? "grid grid-cols-2 gap-4"
                : "flex flex-col"
            }
          >
            {visible.map((t) => (
              <div
                key={t._id}
                onClick={() => {
                  setSelectedTask(t);
                  setDetailText(t.text);
                  setNotes(t.notes || "");
                }}
                className={`bg-white px-4 py-3 rounded shadow cursor-pointer mb-2 ${
                  selectedTask?._id === t._id
                    ? "border-l-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="flex justify-between">
                  <span>{t.text}</span>
                  {t.dueDate && (
                    <span className="text-xs text-blue-500">
                      {t.dueDate.slice(0, 10)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {visible.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              Looks like your list is clear ✨
            </div>
          )}
        </div>

        {/* DETAILS PANEL */}
        {selectedTask && (
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Task details</h3>
              <button onClick={() => setSelectedTask(null)}>✕</button>
            </div>

            {/* TITLE */}
            <input
              value={detailText}
              onChange={(e) => setDetailText(e.target.value)}
              onBlur={() => {
                updateTask({ ...selectedTask, text: detailText });
                setSelectedTask({ ...selectedTask, text: detailText });
              }}
              className="w-full border-b outline-none mb-4"
            />

            {/* NOTES (PERSISTENT) */}
            <textarea
              placeholder="Add notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={async () => {
                const res = await updateTaskNotes(
                  selectedTask._id,
                  notes
                );
                updateTask(res.data);
                setSelectedTask(res.data);
              }}
              className="w-full border rounded p-2 text-sm mb-4"
            />

            {/* ACTIONS */}
            <div className="space-y-3 text-sm">
              <button
                onClick={async () => {
                  const res = await toggleImportant(selectedTask._id);
                  updateTask(res.data);
                  setSelectedTask(res.data);
                }}
              >
                ★ Important
              </button>

              <button
                onClick={async () => {
                  const res = await toggleMyDay(selectedTask._id);
                  updateTask(res.data);
                  setSelectedTask(res.data);
                }}
              >
                ☀ My Day
              </button>

              <input
                type="date"
                value={
                  selectedTask.dueDate
                    ? selectedTask.dueDate.slice(0, 10)
                    : ""
                }
                onChange={async (e) => {
                  const res = await setDueDate(
                    selectedTask._id,
                    e.target.value
                  );
                  updateTask(res.data);
                  setSelectedTask(res.data);
                }}
                className="border rounded px-2 py-1"
              />

              <button
                onClick={() => handleDelete(selectedTask)}
                className="text-red-500"
              >
                Delete task
              </button>
            </div>
          </div>
        )}
      </main>

      {/* UNDO */}
      {deleteItem && (
        <div className="fixed bottom-6 right-6 bg-gray-800 text-white px-4 py-2 rounded flex gap-3">
          <span>Task deleted</span>
          <button onClick={undoDelete} className="underline">
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
