import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

export const getCourses = async () => {
  const response = await api.get("courses/");
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post("auth/token/", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (userData) => {
  const response = await api.post("auth/register/", userData);
  return response.data;
};

export default api;