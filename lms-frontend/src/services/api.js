
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach the latest access token.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Automatically refresh expired access tokens.
let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/token/") &&
      !originalRequest.url?.includes("auth/token/refresh/")
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        return Promise.reject(error);
      }

      try {
        if (!refreshRequest) {
          refreshRequest = axios.post(
            `${API_BASE_URL}auth/token/refresh/`,
            {
              refresh: refreshToken,
            }
          );
        }

        const response = await refreshRequest;
        const newAccessToken = response.data.access;

        localStorage.setItem("access_token", newAccessToken);

        refreshRequest = null;

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        refreshRequest = null;

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Courses
export const getCourses = async () => {
  const response = await api.get("courses/");
  return response.data;
};

// Admin: Create a new course
export const createCourse = async (courseData) => {
  const response = await api.post("courses/", courseData);
  return response.data;
};

// Get details of one course
export const getCourse = async (courseId) => {
  const response = await api.get(`courses/${courseId}/`);
  return response.data;
};

// Course lessons
export const getLessons = async (courseId) => {
  const response = await api.get(
    `courses/lessons/?course=${courseId}`
  );
  return response.data;
};

// Instructor: Create a lesson
export const createLesson = async (lessonData) => {
  const response = await api.post("courses/lessons/", lessonData);
  return response.data;
};

// Instructor: Update a lesson
export const updateLesson = async (lessonId, lessonData) => {
  const response = await api.patch(
    `courses/lessons/${lessonId}/`,
    lessonData
  );
  return response.data;
};

// Instructor: Delete a lesson
export const deleteLesson = async (lessonId) => {
  const response = await api.delete(
    `courses/lessons/${lessonId}/`
  );
  return response.data;
};

// Login
export const loginUser = async (email, password) => {
  const response = await api.post("auth/token/", {
    email,
    password,
  });
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

export const createQuiz = async (quizData) => {
  const response = await api.post("assessments/quizzes/", quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await api.patch(
    `assessments/quizzes/${quizId}/`,
    quizData
  );
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await api.delete(
    `assessments/quizzes/${quizId}/`
  );
  return response.data;
};

export const createQuestion = async (quizId, questionData) => {
  const response = await api.post(
    `assessments/quizzes/${quizId}/questions/`,
    questionData
  );
  return response.data;
};

export const updateQuestion = async (questionId, questionData) => {
  const response = await api.patch(
    `assessments/questions/${questionId}/`,
    questionData
  );
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await api.delete(
    `assessments/questions/${questionId}/`
  );
  return response.data;
};

// Get questions for a specific quiz
export const getQuizQuestions = async (quizId) => {
  const response = await api.get(
    `assessments/quizzes/${quizId}/questions/`
  );
  return response.data;
};

// Start a new quiz attempt
export const startQuizAttempt = async (quizId) => {
  const response = await api.post("assessments/attempts/", {
    quiz: quizId,
  });
  return response.data;
};

// Submit quiz answers
export const submitQuizAttempt = async (
  attemptId,
  answers,
  selectedReviewerId
) => {
  const response = await api.post(
    `assessments/attempts/${attemptId}/submit/`,
    {
      selected_reviewer: selectedReviewerId,
      answers: answers.map((answer) => ({
        question: answer.question,
        selected_answer: answer.selected_answer,
      })),
    }
  );
  return response.data;
};

// Instructor/Admin: Get submitted quizzes awaiting review
export const getQuizSubmissionsForReview = async () => {
  const response = await api.get("assessments/attempts/review/");
  return response.data;
};

// Instructor/Admin: Review a quiz attempt
export const reviewQuizAttempt = async (attemptId, reviewedScore) => {
  const response = await api.patch(
    `assessments/attempts/${attemptId}/review/`,
    {
      reviewed_score: Number(reviewedScore),
    }
  );
  return response.data;
};

// Student quiz attempts
export const getQuizAttempts = async () => {
  const response = await api.get("assessments/attempts/");
  return response.data;
};

// Admin: Get registered students and instructors
export const getAdminUsers = async () => {
  const response = await api.get("auth/admin/users/");
  return response.data;
};

// Public: Submit a contact message
export const submitContactMessage = async (messageData) => {
  const response = await api.post("contact/", messageData);
  return response.data;
};

// Admin: Retrieve submitted contact messages
export const getContactMessages = async () => {
  const response = await api.get("contact/admin/");
  return response.data;
};

// Student: Send a message to a course instructor
export const sendInstructorMessage = async (messageData) => {
  const response = await api.post(
    "contact/instructor/send/",
    messageData
  );
  return response.data;
};

// Instructor: Retrieve messages sent by students
export const getInstructorMessages = async () => {
  const response = await api.get("contact/instructor/");
  return response.data;
};

export default api;
