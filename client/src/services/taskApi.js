import axios from "axios";

const API = "http://localhost:5001/api/tasks";

export const fetchTasks = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const addTask = async (text) => {
  const res = await axios.post(API, { text });
  return res.data;
};

export const updateTask = async (id, data) => {
  const res = await axios.patch(`${API}/${id}`, data);
  return res.data;
};

export const toggleTask = async (id) => {
  const res = await axios.patch(`${API}/${id}/toggle`);
  return res.data;
};

export const toggleImportant = async (id) => {
  const res = await axios.patch(`${API}/${id}/important`);
  return res.data;
};

export const toggleMyDay = async (id) => {
  const res = await axios.patch(`${API}/${id}/myday`);
  return res.data;
};

export const setDueDate = async (id, dueDate) => {
  const res = await axios.patch(`${API}/${id}/duedate`, { dueDate });
  return res.data;
};

export const deleteTask = async (id) => {
  await axios.delete(`${API}/${id}`);
};

/* 🧩 SUBTASKS */
export const addSubtask = async (taskId, text) => {
  const res = await axios.post(
    `${API}/${taskId}/subtasks`,
    { text }
  );
  return res.data;
};

export const toggleSubtask = async (taskId, subId) => {
  const res = await axios.patch(
    `${API}/${taskId}/subtasks/${subId}`
  );
  return res.data;
};

export const deleteSubtask = async (taskId, subId) => {
  const res = await axios.delete(
    `${API}/${taskId}/subtasks/${subId}`
  );
  return res.data;
};
