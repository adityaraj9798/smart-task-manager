import API from "./api";

export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

export const createTask = async (title) => {
  const res = await API.post("/tasks", { title });
  return res.data;
};
