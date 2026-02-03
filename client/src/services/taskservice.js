import axios from "axios";

const API = "http://localhost:5000/api/tasks";

export const fetchTasks = () => axios.get(API);
export const addTask = (text) => axios.post(API, { text });
export const deleteTask = (id) => axios.delete(`${API}/${id}`);
export const toggleTask = (id) => axios.patch(`${API}/${id}`);
