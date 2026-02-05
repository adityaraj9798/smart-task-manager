import { useEffect, useMemo, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  FiTrash2, FiSun, FiStar, FiList, FiX, FiCircle, 
  FiCheckCircle, FiBell, FiSearch, FiMenu, FiMoon, FiFlag, 
  FiFileText, FiTag 
} from "react-icons/fi";

import {
  fetchTasks, addTask, updateTask, toggleTask,
  toggleImportant, deleteTask, addSubtask, 
  toggleSubtask, deleteSubtask
} from "../services/taskApi";

/* ================= HELPERS ================= */
const normalizeDate = (d) => {
  if (!d) return null;
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split('T')[0];
};

const CATEGORIES = ["Work", "Personal", "Urgent", "Shopping", "Health"];

const CATEGORY_COLORS = {
  Work: "bg-purple-500/10 text-purple-600 border-purple-200 dark:border-purple-900/50 dark:text-purple-400",
  Personal: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900/50 dark:text-emerald-400",
  Urgent: "bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-900/50 dark:text-rose-400",
  Shopping: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-400",
  Health: "bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-900/50 dark:text-sky-400"
};

const today = normalizeDate(new Date());
const tomorrow = normalizeDate(new Date(Date.now() + 86400000));

/* ================= PROGRESS RING COMPONENT ================= */
const ProgressRing = ({ percentage }) => {
  const radius = 30;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center mb-8 p-4 bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white dark:border-white/10 shadow-xl">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset: 0 }}
            className="text-slate-200 dark:text-white/10"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <motion.circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="text-blue-500"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span className="absolute text-[12px] font-black text-slate-800 dark:text-white">
          {Math.round(percentage)}%
        </span>
      </div>
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-2 tracking-widest">Efficiency</span>
    </div>
  );
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState("");
  const [view, setView] = useState("Tasks");
  const [selected, setSelected] = useState(null);
  const [stepText, setStepText] = useState("");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [isSortedByPriority, setIsSortedByPriority] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchTasks().then(setTasks);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  /* ================= PROGRESS & CELEBRATION ================= */
  const dailyProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return (completed / tasks.length) * 100;
  }, [tasks]);

  useEffect(() => {
    if (dailyProgress === 100 && tasks.length > 0) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  }, [dailyProgress, tasks.length]);

  const updateLocal = (updated) => {
    if (!updated) return;
    setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    setSelected(prev => (prev && prev._id === updated._id ? { ...updated } : prev));
  };

  /* ================= HANDLERS ================= */
  const onDragEnd = (result) => {
    if (!result.destination || isSortedByPriority || activeCategory !== "All") return;
    const items = Array.from(tasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTasks(items);
  };

  const handleAdd = async () => {
    if (!newText.trim()) return;
    const task = await addTask(newText.trim());
    setTasks((prev) => [task, ...prev]);
    setNewText("");
  };

  const handleDelete = (task) => {
    setTasks((prev) => prev.filter((t) => t._id !== task._id));
    setSelected(null);
    deleteTask(task._id);
  };

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter(t => t.completed);
    setTasks(prev => prev.filter(t => !t.completed));
    for (const t of completedTasks) {
      await deleteTask(t._id);
    }
  };

  /* ================= FILTER & SORT LOGIC ================= */
  const visibleTasks = useMemo(() => {
    let filtered = [...tasks];
    if (view === "Important") filtered = filtered.filter((t) => t.important);
    if (view === "My Day") filtered = filtered.filter((t) => t.myDay);
    if (search.trim()) filtered = filtered.filter((t) => t.text.toLowerCase().includes(search.toLowerCase()));
    if (activeCategory !== "All") filtered = filtered.filter((t) => t.category === activeCategory);
    
    if (isSortedByPriority) {
      const weight = { High: 3, Medium: 2, Low: 1, undefined: 0 };
      filtered.sort((a, b) => weight[b.priority] - weight[a.priority]);
    }
    return filtered;
  }, [tasks, view, search, isSortedByPriority, activeCategory]);

  // Grouped logic for Planned view
  const plannedGroups = useMemo(() => {
    const groups = { Earlier: [], Today: [], Tomorrow: [], Future: [] };
    tasks.forEach((t) => {
      const d = normalizeDate(t.dueDate);
      if (!d) return;
      if (d < today) groups.Earlier.push(t);
      else if (+d === +today) groups.Today.push(t);
      else if (+d === +tomorrow) groups.Tomorrow.push(t);
      else groups.Future.push(t);
    });
    return groups;
  }, [tasks]);

  /* ================= RENDER TASK ITEM ================= */
  const renderTaskItem = (t, index, isDraggable = true) => {
    const priorityColors = { High: "bg-rose-500 text-white", Medium: "bg-amber-500 text-white", Low: "bg-emerald-500 text-white" };
    
    const itemContent = (
      <div
        onClick={() => setSelected(t)}
        className={`px-3 md:px-4 py-4 border-b cursor-pointer flex items-center justify-between transition-all duration-300 ${
          t.myDay && view !== "My Day" ? "bg-blue-500/5 dark:bg-blue-500/10" : "bg-white dark:bg-white/5"
        } border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10`}
      >
        <div className="flex items-center gap-3 md:gap-4 flex-1 overflow-hidden">
          {isDraggable && !isSortedByPriority && activeCategory === "All" && <FiMenu className="hidden md:block text-slate-300 dark:text-slate-600" />}
          <button onClick={async (e) => { e.stopPropagation(); updateLocal(await toggleTask(t._id)); }}>
            {t.completed ? <FiCheckCircle className="text-blue-500 text-xl" /> : <FiCircle className="text-slate-300 dark:text-slate-600 text-xl" />}
          </button>
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[14px] md:text-[15px] font-semibold truncate ${t.completed ? "line-through text-slate-400" : "text-slate-800 dark:text-slate-200"}`}>
                {t.text}
              </span>
              <div className="flex gap-1">
                {t.category && <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${CATEGORY_COLORS[t.category]}`}>{t.category}</span>}
                {t.priority && <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-widest ${priorityColors[t.priority]}`}>{t.priority}</span>}
              </div>
            </div>
          </div>
        </div>
        <button onClick={async (e) => { e.stopPropagation(); updateLocal(await toggleImportant(t._id)); }} className="ml-2">
          <FiStar className={`text-lg transition-all ${t.important ? "text-blue-500 fill-blue-500 scale-110" : "text-slate-300 hover:text-blue-400"}`} />
        </button>
      </div>
    );

    return isDraggable ? (
      <Draggable key={t._id} draggableId={t._id} index={index} isDragDisabled={isSortedByPriority || activeCategory !== "All"}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>{itemContent}</div>
        )}
      </Draggable>
    ) : <div key={t._id}>{itemContent}</div>;
  };

  return (
    <div className={`h-screen flex font-sans transition-colors duration-500 overflow-hidden ${darkMode ? "bg-black" : "bg-slate-50"}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-white/5 backdrop-blur-xl border-r border-slate-200 dark:border-white/10 p-6 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center mb-8">
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-400">ZenTasks</div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-500"><FiX /></button>
        </div>

        <ProgressRing percentage={dailyProgress} />

        <div className="flex-1 space-y-1">
          {[{ id: "My Day", icon: <FiSun /> }, { id: "Important", icon: <FiStar /> }, { id: "Planned", icon: <FiList /> }, { id: "Tasks", icon: null }].map((item) => (
            <div key={item.id} onClick={() => { setView(item.id); setIsSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${view === item.id ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"}`}>
              <span className="text-lg">{item.icon}</span>
              <span className="font-bold text-sm">{item.id}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setDarkMode(!darkMode)} className="mt-auto p-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center hover:scale-105 transition-transform">
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="flex items-center justify-between p-4 md:hidden bg-white/80 dark:bg-white/5 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
           <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600 dark:text-slate-400 text-xl"><FiMenu /></button>
           <div className="font-black text-blue-500">ZenTasks</div>
           <div className="w-6"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{view}</h1>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{new Date().toDateString()}</span>
            </div>
            <div className="flex gap-2">
              {tasks.some(t => t.completed) && (
                <button onClick={handleClearCompleted} className="flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20 hover:scale-105 transition-transform">
                  <FiTrash2 /> <span className="hidden sm:inline">Clear Done</span>
                </button>
              )}
              <button onClick={() => setIsSortedByPriority(!isSortedByPriority)} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all hover:scale-105 ${isSortedByPriority ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30 border-blue-500' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400'}`}>
                <FiFlag className="inline mr-2" /> <span>{isSortedByPriority ? "Priority Mode" : "Sort"}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border transition-all duration-300 whitespace-nowrap shadow-sm hover:scale-105 ${activeCategory === cat ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:border-blue-300'}`}>{cat}</button>
            ))}
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white dark:border-white/10 shadow-sm flex items-center gap-3">
              <FiSearch className="text-slate-400 ml-2" />
              <input placeholder="Search intelligence..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent text-slate-800 dark:text-slate-200 text-sm font-medium" />
            </div>

            {view === "Tasks" && (
              <div className="bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg flex gap-4 ring-2 ring-blue-500/5">
                <input placeholder="What's your next move?" value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} className="flex-1 outline-none bg-transparent text-slate-900 dark:text-white font-bold text-sm" />
                <button onClick={handleAdd} className="bg-blue-500 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">Add</button>
              </div>
            )}
          </div>

          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white dark:border-white/10 overflow-hidden mb-20 md:mb-0">
            {view === "Planned" ? (
              Object.entries(plannedGroups).map(([name, items]) => (
                <div key={name}>
                  <div className="px-5 py-4 bg-slate-100/50 dark:bg-white/10 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/10">{name} ({items.length})</div>
                  <AnimatePresence>
                    {items.map((t) => renderTaskItem(t, 0, false))}
                  </AnimatePresence>
                </div>
              ))
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks-list">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <AnimatePresence>
                        {visibleTasks.map((t, i) => renderTaskItem(t, i, true))}
                      </AnimatePresence>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}
          </div>
        </div>
      </main>

      {/* DETAIL PANEL */}
      <AnimatePresence>
        {selected && (
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 md:inset-y-0 md:left-auto md:right-0 z-[100] w-full md:w-[400px] bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
              <h3 className="font-black text-xs uppercase tracking-widest text-slate-400">Intelligence</h3>
              <button onClick={() => setSelected(null)} className="p-2 bg-slate-200 dark:bg-white/10 rounded-full hover:scale-110 transition-transform"><FiX /></button>
            </div>
            
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              <div className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{selected.text}</div>
              
              <button onClick={async () => updateLocal(await updateTask(selected._id, { myDay: !selected.myDay }))} className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${selected.myDay ? 'bg-blue-500 text-white border-blue-500 shadow-xl shadow-blue-500/30' : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-400'}`}>
                <FiSun className="text-lg" /> {selected.myDay ? "Focus Active" : "Set Daily Focus"}
              </button>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest italic">Assignment</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button key={cat} onClick={async () => updateLocal(await updateTask(selected._id, { category: selected.category === cat ? null : cat }))} className={`px-4 py-2 text-[10px] font-black rounded-full border transition-all duration-300 uppercase tracking-widest ${selected.category === cat ? CATEGORY_COLORS[cat] + " border-transparent scale-105" : 'text-slate-400 border-slate-200 dark:border-white/10'}`}>{cat}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest italic">Threat Level</label>
                  <div className="flex gap-2">
                    {["Low", "Medium", "High"].map(p => (
                      <button key={p} onClick={async () => updateLocal(await updateTask(selected._id, { priority: p }))} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${selected.priority === p ? 'bg-blue-500 text-white border-blue-500 shadow-lg' : 'text-slate-400 border-slate-200 dark:border-white/10'}`}>{p}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest italic">Deadline</label>
                  <input type="date" value={formatDateForInput(selected.dueDate)} onChange={async (e) => updateLocal(await updateTask(selected._id, { dueDate: e.target.value }))} className="w-full border-b-2 border-slate-100 dark:border-white/10 py-3 text-lg font-bold bg-transparent text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors" />
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-6 block tracking-widest italic">Sub-Objectives</div>
                  <div className="space-y-3 mb-6">
                    {selected.subtasks?.map((s) => (
                      <div key={s._id} className="flex items-center gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl group border border-transparent hover:border-blue-500/20 transition-all">
                        <input type="checkbox" checked={s.completed} onChange={async () => updateLocal(await toggleSubtask(selected._id, s._id))} className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-600 text-blue-500 transition-all" />
                        <span className={`flex-1 text-sm font-bold ${s.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-300"}`}>{s.text}</span>
                        <button onClick={async () => updateLocal(await deleteSubtask(selected._id, s._id))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><FiX /></button>
                      </div>
                    ))}
                  </div>
                  <input placeholder="Append sub-objective..." value={stepText} onChange={(e) => setStepText(e.target.value)} onKeyDown={async (e) => {
                      if (e.key === "Enter" && stepText.trim()) { updateLocal(await addSubtask(selected._id, stepText)); setStepText(""); }
                    }} className="w-full bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-blue-500/50" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block tracking-widest italic">Transmission Notes</label>
                  <textarea 
                    placeholder="Enter additional data..."
                    value={selected.notes || ""}
                    onChange={async (e) => {
                      const val = e.target.value;
                      setSelected({ ...selected, notes: val });
                      await updateTask(selected._id, { notes: val });
                    }}
                    className="w-full min-h-[120px] bg-slate-100 dark:bg-white/5 rounded-2xl p-5 text-sm font-bold text-slate-800 dark:text-slate-200 outline-none resize-none focus:ring-2 ring-blue-500/20"
                  />
                </div>

                <button onClick={() => handleDelete(selected)} className="w-full py-4 text-rose-500 font-black text-[10px] uppercase tracking-widest border-2 border-rose-500/10 rounded-2xl hover:bg-rose-500 hover:text-white transition-all"><FiTrash2 className="inline mr-2" /> Terminate Record</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}