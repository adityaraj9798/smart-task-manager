import { useEffect, useMemo, useState } from "react";
import {
  FiTrash2,
  FiSun,
  FiStar,
  FiList,
  FiX,
  FiCircle,
  FiCheckCircle,
  FiBell,
} from "react-icons/fi";

import {
  fetchTasks,
  addTask,
  updateTask,
  toggleTask,
  toggleImportant,
  setDueDate,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
} from "../services/taskApi";

/* ================= DATE HELPERS ================= */
const normalizeDate = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const today = normalizeDate(new Date());
const tomorrow = normalizeDate(
  new Date(Date.now() + 86400000)
);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState("");
  const [view, setView] = useState("Tasks");

  const [selected, setSelected] = useState(null);
  const [stepText, setStepText] = useState("");

  const [deleted, setDeleted] = useState(null);
  const [undoTimer, setUndoTimer] = useState(null);

  /* ================= NOTIFICATION PERMISSION ================= */
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /* ================= LOAD TASKS ================= */
  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  const updateLocal = (updated) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updated._id ? updated : t))
    );
    setSelected(updated);
  };

  /* ================= ADD TASK ================= */
  const handleAdd = async () => {
    if (!newText.trim()) return;
    const task = await addTask(newText.trim());
    setTasks((prev) => [task, ...prev]);
    setNewText("");
  };

  /* ================= DELETE + UNDO ================= */
  const handleDelete = (task) => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    setSelected(null);
    setDeleted(task);

    const timer = setTimeout(async () => {
      await deleteTask(task._id);
      setDeleted(null);
    }, 5000);

    setUndoTimer(timer);
  };

  const undoDelete = () => {
    clearTimeout(undoTimer);
    setTasks((prev) => [deleted, ...prev]);
    setDeleted(null);
  };

  /* ================= REMINDER ================= */
  const setReminder = (task) => {
    if (!task.dueDate) {
      alert("Please set a due date first");
      return;
    }

    const delay = new Date(task.dueDate).getTime() - Date.now();
    if (delay <= 0) {
      alert("Due date must be in the future");
      return;
    }

    setTimeout(() => {
      if (Notification.permission === "granted") {
        new Notification("⏰ Task Reminder", {
          body: task.text,
        });
      }
    }, delay);

    alert("Reminder set 🔔");
  };

  /* ================= FILTERED TASKS ================= */
  const visibleTasks = useMemo(() => {
    if (view === "Important")
      return tasks.filter((t) => t.important);

    if (view === "My Day")
      return tasks.filter((t) => t.myDay);

    return tasks;
  }, [tasks, view]);

  /* ================= PLANNED GROUPS ================= */
  const plannedGroups = useMemo(() => {
    const groups = {
      earlier: [],
      today: [],
      tomorrow: [],
      future: [],
    };

    tasks.forEach((t) => {
      if (!t.dueDate || !t.text?.trim()) return;
      const d = normalizeDate(t.dueDate);

      if (d < today) groups.earlier.push(t);
      else if (+d === +today) groups.today.push(t);
      else if (+d === +tomorrow) groups.tomorrow.push(t);
      else groups.future.push(t);
    });

    return groups;
  }, [tasks]);

  /* ================= RENDER TASK ================= */
  const renderTask = (t) => (
    <div
      key={t._id}
      onClick={() => setSelected(t)}
      className="flex justify-between items-center px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
    >
      <div className="flex items-center gap-3">
        <button
          onClick={async (e) => {
            e.stopPropagation();
            updateLocal(await toggleTask(t._id));
          }}
        >
          {t.completed ? (
            <FiCheckCircle className="text-blue-600" />
          ) : (
            <FiCircle />
          )}
        </button>

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

      <div className="flex items-center gap-4">
        {/* ⭐ IMPORTANT */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            updateLocal(await toggleImportant(t._id));
          }}
        >
          <FiStar
            className={
              t.important
                ? "text-blue-600 fill-blue-600"
                : "text-gray-400"
            }
          />
        </button>

        <FiTrash2
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(t);
          }}
          className="text-red-400 hover:text-red-600"
        />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-[#f5f6f8]">
      {/* SIDEBAR */}
      <aside className="w-60 bg-white border-r p-4 hidden md:block">
        <div className="text-xl font-semibold text-blue-600 mb-4">
          To Do
        </div>

        {[
          { label: "My Day", icon: <FiSun /> },
          { label: "Important", icon: <FiStar /> },
          { label: "Planned", icon: <FiList /> },
          { label: "Tasks", icon: null },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => setView(item.label)}
            className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer mb-1 ${
              view === item.label
                ? "bg-blue-100 text-blue-600"
                : "hover:bg-gray-100"
            }`}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-lg font-semibold mb-4">
          {view}
        </h1>

        {view === "Tasks" && (
          <div className="bg-white p-3 rounded shadow mb-4 flex gap-3">
            <input
              placeholder="Add a task"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 outline-none"
            />
            <button onClick={handleAdd}>Add</button>
          </div>
        )}

        <div className="bg-white rounded shadow">
          {view === "Planned" ? (
            <>
              <div className="px-4 py-2 font-semibold">
                Earlier ({plannedGroups.earlier.length})
              </div>
              {plannedGroups.earlier.map(renderTask)}

              <div className="px-4 py-2 font-semibold">
                Today ({plannedGroups.today.length})
              </div>
              {plannedGroups.today.map(renderTask)}

              <div className="px-4 py-2 font-semibold">
                Tomorrow ({plannedGroups.tomorrow.length})
              </div>
              {plannedGroups.tomorrow.map(renderTask)}

              <div className="px-4 py-2 font-semibold">
                Future ({plannedGroups.future.length})
              </div>
              {plannedGroups.future.map(renderTask)}
            </>
          ) : visibleTasks.length === 0 ? (
            <div className="p-6 text-center text-gray-400">
              No tasks here
            </div>
          ) : (
            visibleTasks.map(renderTask)
          )}
        </div>
      </main>

      {/* DETAILS PANEL */}
      {selected && (
        <div className="w-96 bg-white border-l p-5">
          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Task details</h3>
            <FiX onClick={() => setSelected(null)} />
          </div>

          <div className="mb-3 font-medium">{selected.text}</div>

          <label className="text-sm font-medium">Due date</label>
          <input
            type="date"
            value={
              selected.dueDate
                ? selected.dueDate.slice(0, 10)
                : ""
            }
            onChange={async (e) =>
              updateLocal(
                await setDueDate(
                  selected._id,
                  e.target.value
                )
              )
            }
            className="border rounded px-2 py-1 w-full mb-3"
          />

          <button
            onClick={() => setReminder(selected)}
            className="flex items-center gap-2 text-blue-600 mb-3"
          >
            <FiBell /> Set reminder
          </button>

          <button
            onClick={async () =>
              updateLocal(
                await toggleImportant(selected._id)
              )
            }
            className="flex items-center gap-2 text-blue-600 mb-4"
          >
            <FiStar /> Toggle important
          </button>

          {/* STEPS */}
          <div className="mb-4">
            <div className="font-medium mb-1">Steps</div>

            {selected.subtasks?.map((s) => (
              <div
                key={s._id}
                className="flex items-center gap-2 mb-2"
              >
                <input
                  type="checkbox"
                  checked={s.completed}
                  onChange={async () =>
                    updateLocal(
                      await toggleSubtask(
                        selected._id,
                        s._id
                      )
                    )
                  }
                />
                <span
                  className={
                    s.completed
                      ? "line-through text-gray-400"
                      : ""
                  }
                >
                  {s.text}
                </span>
                <button
                  onClick={async () =>
                    updateLocal(
                      await deleteSubtask(
                        selected._id,
                        s._id
                      )
                    )
                  }
                  className="text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}

            <input
              placeholder="Add a step"
              value={stepText}
              onChange={(e) => setStepText(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key === "Enter" && stepText.trim()) {
                  updateLocal(
                    await addSubtask(
                      selected._id,
                      stepText
                    )
                  );
                  setStepText("");
                }
              }}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <button
            onClick={() => handleDelete(selected)}
            className="text-red-500"
          >
            Delete task
          </button>
        </div>
      )}

      {/* UNDO */}
      {deleted && (
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
