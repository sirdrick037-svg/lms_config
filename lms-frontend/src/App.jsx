
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseDetails from "./pages/CourseDetails";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Quizzes from "./Quizzes";
import QuizReviews from "./pages/QuizReviews";
import JoinRequest from "./pages/JoinRequest";
import AcceptInvitation from "./pages/AcceptInvitation";
import AdminJoinRequests from "./pages/AdminJoinRequests";

import "./App.css";

function AdminOnlyRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return user?.is_staff ? (
    <AdminJoinRequests />
  ) : (
    <h2>You do not have permission to access this page.</h2>
  );
}

function QuizReviewRoute() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return user?.is_staff || user?.role === "INSTRUCTOR" ? (
    <QuizReviews />
  ) : (
    <h2>You do not have permission to review quizzes.</h2>
  );
}

function App() {
  
  return (
    <BrowserRouter>
      <div className="app">
        <Header />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Navigate to="/join" replace />} />
            <Route path="/join" element={<JoinRequest />} />
            <Route path="/accept-invitation" element={<AcceptInvitation />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
            <Route path="/admin/join-requests" element={<ProtectedRoute><AdminOnlyRoute /></ProtectedRoute>}/>
            <Route path="/quiz-reviews" element={<ProtectedRoute><QuizReviewRoute /></ProtectedRoute>}/>
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
