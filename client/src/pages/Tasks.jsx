import { useEffect, useState } from "react";
import {
  fetchTasks,
  addTask,
  deleteTask,
  toggleTask,
  toggleImportant,
  toggleMyDay,
  setDueDate,
} from "../services/taskApi";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("Tasks");
  const [layout, setLayout] = useState("list"); // list | grid
  const [search, setSearch] = useState("");
  const [taskText, setTaskText] = useState("");

  const [selectedTask, setSelectedTask] = useState(null);
  const [notes, setNotes] = useState("");

  /* ================= LOAD TASKS ================= */
  useEffect(() => {
    fetchTasks()
      .then((res) => setTasks(res.data || []))
      .catch(() => setTasks([]));
  }, []);

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

  /* ================= FILTER ================= */
  let visible = tasks.filter(
    (t) =>
      t?.text &&
      t.text.toLowerCase().includes(search.toLowerCase())
  );

  if (view === "Important") visible = visible.filter((t) => t.important);
  if (view === "My Day") visible = visible.filter((t) => t.myDay);
  if (view === "Planned") visible = visible.filter((t) => t.dueDate);

  /* ================= DRAG REORDER ================= */
  const onDragEnd = (from, to) => {
    if (to < 0) return;
    const copy = [...tasks];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setTasks(copy);
  };

  /* ================= DUE DATE BADGE ================= */
  const dueBadge = (due) => {
    if (!due) return null;
    const d = new Date(due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (d < today) return "Overdue";
    if (d.getTime() === today.getTime()) return "Today";
    return null;
  };

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
            onClick={() => setLayout("list")}
            className={layout === "list" ? "font-bold" : ""}
          >
            List
          </button>
          <button
            onClick={() => setLayout("grid")}
            className={layout === "grid" ? "font-bold" : ""}
          >
            Grid
          </button>

          <input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>

        {/* CONTENT */}
        <div
          className={`flex-1 overflow-auto px-8 py-6 ${
            layout === "grid"
              ? "grid grid-cols-2 gap-4"
              : ""
          }`}
        >
          {/* ADD TASK */}
          {view === "Tasks" && (
            <div className="bg-white p-4 rounded shadow mb-4 col-span-full">
              <input
                placeholder="Add a task"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full outline-none"
              />
            </div>
          )}

          {/* TASK LIST */}
          {visible.map((t, i) => (
            <div
              key={t._id}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("index", i)
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) =>
                onDragEnd(
                  Number(e.dataTransfer.getData("index")),
                  i
                )
              }
              onClick={() => {
                setSelectedTask(t);
                setNotes(t.notes || "");
              }}
              className="bg-white px-4 py-3 rounded shadow cursor-pointer flex gap-3 items-center"
            >
              <input
                type="checkbox"
                checked={!!t.completed}
                onChange={async (e) => {
                  e.stopPropagation();
                  const res = await toggleTask(t._id);
                  updateTask(res.data);
                }}
              />

              <span
                className={`flex-1 ${
                  t.completed
                    ? "line-through text-gray-400"
                    : ""
                }`}
              >
                {t.text}
              </span>

              {dueBadge(t.dueDate) && (
                <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded">
                  {dueBadge(t.dueDate)}
                </span>
              )}

              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const res = await toggleImportant(t._id);
                  updateTask(res.data);
                }}
              >
                {t.important ? "⭐" : "☆"}
              </button>
            </div>
          ))}
        </div>

        {/* DETAILS PANEL */}
        {selectedTask && (
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-lg p-5">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">Task details</h3>
              <button onClick={() => setSelectedTask(null)}>✕</button>
            </div>

            <p className="font-medium mb-2">{selectedTask.text}</p>

            <textarea
              placeholder="Add notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() =>
                updateTask({
                  ...selectedTask,
                  notes,
                })
              }
              className="w-full border rounded p-2 text-sm mb-4"
            />

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
              className="border rounded px-2 py-1 w-full"
            />

            <button
              onClick={async () => {
                await deleteTask(selectedTask._id);
                setSelectedTask(null);
                setTasks((t) =>
                  t.filter((x) => x._id !== selectedTask._id)
                );
              }}
              className="text-red-500 mt-6"
            >
              Delete task
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
