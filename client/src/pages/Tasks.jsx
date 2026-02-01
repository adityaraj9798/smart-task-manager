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
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState("Tasks");
  const [layout, setLayout] = useState("list");
  const [sortBy, setSortBy] = useState("created");
  const [groupBy, setGroupBy] = useState("none");
  const [showSort, setShowSort] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    fetchTasks().then((res) => setTasks(res.data));
  }, []);

  const handleAdd = async () => {
    if (!task.trim()) return;
    const res = await addTask(task.trim());
    setTasks([res.data, ...tasks]);
    setTask("");
  };

  const updateTask = (updated) =>
    setTasks(tasks.map((t) => (t._id === updated._id ? updated : t)));

  const handleToggle = async (id) => updateTask((await toggleTask(id)).data);
  const handleImportant = async (id) =>
    updateTask((await toggleImportant(id)).data);
  const handleMyDay = async (id) =>
    updateTask((await toggleMyDay(id)).data);
  const handleDueDate = async (id, date) =>
    updateTask((await setDueDate(id, date)).data);

  const handleDelete = async (id) => {
    await deleteTask(id);
    setTasks(tasks.filter((t) => t._id !== id));
  };

  /* FILTER */
  const cleaned = tasks.filter((t) => t.text && t.text.trim() !== "");
  let visible = cleaned;
  if (view === "Important") visible = cleaned.filter((t) => t.important);
  if (view === "My Day") visible = cleaned.filter((t) => t.myDay);
  if (view === "Planned") visible = cleaned.filter((t) => t.dueDate);

  /* SORT */
  const sorted = [...visible].sort((a, b) => {
    if (sortBy === "alpha") return a.text.localeCompare(b.text);
    if (sortBy === "due") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (sortBy === "important")
      return (b.important === true) - (a.important === true);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  /* GROUP */
  const groups =
    groupBy === "none"
      ? { All: sorted }
      : groupBy === "completed"
      ? {
          Completed: sorted.filter((t) => t.completed),
          Pending: sorted.filter((t) => !t.completed),
        }
      : groupBy === "important"
      ? {
          Important: sorted.filter((t) => t.important),
          Others: sorted.filter((t) => !t.important),
        }
      : {
          Planned: sorted.filter((t) => t.dueDate),
          "No date": sorted.filter((t) => !t.dueDate),
        };

  return (
    <div className="h-screen flex bg-[#f5f6f8] text-gray-800">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="px-6 py-4 text-xl font-semibold text-blue-600">
          To Do
        </div>

        {["My Day", "Important", "Planned", "Tasks"].map((item) => (
          <div
            key={item}
            onClick={() => setView(item)}
            className={`mx-3 my-1 px-3 py-2 rounded-md cursor-pointer transition ${
              view === item
                ? "bg-blue-50 text-blue-600 font-medium"
                : "hover:bg-gray-100"
            }`}
          >
            {item}
          </div>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <div className="h-14 bg-white border-b flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold">{view}</h1>

          <div className="flex gap-6 text-sm">
            <div className="flex gap-3">
              <span
                onClick={() => setLayout("grid")}
                className={`cursor-pointer ${
                  layout === "grid" ? "text-blue-600 font-medium" : ""
                }`}
              >
                Grid
              </span>
              <span
                onClick={() => setLayout("list")}
                className={`cursor-pointer ${
                  layout === "list" ? "text-blue-600 font-medium" : ""
                }`}
              >
                List
              </span>
            </div>

            <span
              onClick={() => setShowSort(!showSort)}
              className="cursor-pointer hover:text-blue-600"
            >
              Sort
            </span>

            <span
              onClick={() => setShowGroup(!showGroup)}
              className="cursor-pointer hover:text-blue-600"
            >
              Group
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-auto px-10 py-6">
          {view === "Tasks" && (
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-3">
              <input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="Add a task"
                className="flex-1 outline-none text-sm"
              />
              <button
                onClick={handleAdd}
                className="text-sm text-blue-600 font-medium"
              >
                Add
              </button>
            </div>
          )}

          {Object.entries(groups).map(
            ([groupName, groupTasks]) =>
              groupTasks.length > 0 && (
                <div key={groupName} className="mb-6">
                  {groupBy !== "none" && (
                    <h2 className="text-xs font-semibold text-gray-500 mb-2 uppercase">
                      {groupName}
                    </h2>
                  )}

                  <div
                    className={
                      layout === "grid"
                        ? "grid grid-cols-3 gap-4"
                        : "space-y-2"
                    }
                  >
                    {groupTasks.map((t) => (
                      <div
                        key={t._id}
                        className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center justify-between hover:shadow transition"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            onClick={() => handleToggle(t._id)}
                            className={`w-5 h-5 rounded-full border cursor-pointer ${
                              t.completed
                                ? "bg-blue-600 border-blue-600"
                                : "border-gray-400"
                            }`}
                          />
                          <span
                            className={
                              t.completed
                                ? "line-through text-gray-400"
                                : ""
                            }
                          >
                            {t.text}
                          </span>
                        </div>

                        <div className="flex gap-4 text-lg">
                          <span
                            onClick={() => handleMyDay(t._id)}
                            className={`cursor-pointer ${
                              t.myDay
                                ? "text-orange-400"
                                : "text-gray-300 hover:text-orange-300"
                            }`}
                          >
                            ☀
                          </span>
                          <span
                            onClick={() => handleImportant(t._id)}
                            className={`cursor-pointer ${
                              t.important
                                ? "text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                          >
                            ★
                          </span>
                          <button
                            onClick={() => handleDelete(t._id)}
                            className="text-gray-300 hover:text-red-500"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      </main>
    </div>
  );
}
