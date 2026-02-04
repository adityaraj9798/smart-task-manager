import axios from "axios";

const API = "http://localhost:5001/api/tasks";

/* 🔥 TOKEN HEADER (PURANE FLOW KE SAATH) */
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

/* ================= TASK APIs ================= */

export const fetchTasks = () =>
  axios.get(API, authConfig());

export const addTask = (text) =>
  axios.post(API, { text }, authConfig());

export const deleteTask = (id) =>
  axios.delete(`${API}/${id}`, authConfig());

export const toggleTask = (id) =>
  axios.patch(`${API}/${id}`, {}, authConfig());

export const toggleImportant = (id) =>
  axios.patch(`${API}/${id}/important`, {}, authConfig());

export const toggleMyDay = (id) =>
  axios.patch(`${API}/${id}/myday`, {}, authConfig());

export const setDueDate = (id, dueDate) =>
  axios.patch(
    `${API}/${id}/duedate`,
    { dueDate },
    authConfig()
  );

/* ================================================= */
/* 🔥 SUBTASK APIs — NAYA ADD (ISSE ERROR FIX HOGA) */
/* ================================================= */

export const addSubtask = (taskId, text) =>
  axios.post(
    `${API}/${taskId}/subtasks`,
    { text },
    authConfig()
  );

export const toggleSubtask = (taskId, subId) =>
  axios.patch(
    `${API}/${taskId}/subtasks/${subId}`,
    {},
    authConfig()
  );

export const deleteSubtask = (taskId, subId) =>
  axios.delete(
    `${API}/${taskId}/subtasks/${subId}`,
    authConfig()
  );
export const updateTaskNotes = (id, notes) =>
  axios.patch(
    `${API}/${id}`,
    { notes },
    authConfig()
  );
