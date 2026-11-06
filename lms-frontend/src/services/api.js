
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Automatically attach the logged-in student's token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Courses
export const getCourses = async () => {
  const response = await api.get("courses/");
  return response.data;
};
// Course lessons
export const getLessons = async (courseId) => {
  const response = await api.get(
    `courses/lessons/?course=${courseId}`
  );

  return response.data;
};

// Login
export const loginUser = async (email, password) => {
  const response = await api.post("auth/token/", { email, password });
  return response.data;
};

// Registration
export const registerUser = async (userData) => {
  const response = await api.post("auth/register/", userData);
  return response.data;
};

// Student enrollments
export const getEnrollments = async () => {
  const response = await api.get("enrollments/");
  return response.data;
};
// Enroll in a course
export const enrollInCourse = async (courseId) => {
  const response = await api.post("enrollments/", {
    course: courseId,
  });

  return response.data;
};

// Student payments
export const getPayments = async () => {
  const response = await api.get("enrollments/payments/");
  return response.data;
};
// Initiate M-Pesa course payment
export const initiatePayment = async (courseId, phoneNumber) => {
  const response = await api.post("enrollments/payments/", {
    course: courseId,
    phone_number: phoneNumber,
  });

  return response.data;
};

// Student lesson progress
export const getLessonProgress = async () => {
  const response = await api.get("enrollments/progress/");
  return response.data;
};
// Mark a lesson as completed
export const markLessonCompleted = async (enrollmentId, lessonId) => {
  const response = await api.post("enrollments/progress/", {
    enrollment: enrollmentId,
    lesson: lessonId,
    is_completed: true,
  });

  return response.data;
};
// Student quizzes
export const getQuizzes = async () => {
  const response = await api.get("assessments/quizzes/");
  return response.data;
};

// Get questions for a specific quiz
export const getQuizQuestions = async (quizId) => {
  const response = await api.get(
    `assessments/quizzes/${quizId}/questions/`
  );
  return response.data;
};

export default api;
