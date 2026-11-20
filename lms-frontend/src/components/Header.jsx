
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("access_token"));
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isAdmin = user?.is_staff;
  const isInstructor = user?.role === "INSTRUCTOR" && !isAdmin;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("student_name");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        SkillNest
      </Link>

      <nav className="navbar">
        {isAdmin ? (
          <>
            <Link to="/admin">Admin Dashboard</Link>
            <Link to="/admin/join-requests">
              Invitation Requests
            </Link>
            <Link to="/courses">Courses</Link>
          </>
        ) : isInstructor ? (
          <>
            <Link to="/courses">My Assigned Courses</Link>
            <Link to="/instructor-lessons">My Lessons</Link>
            <Link to="/instructor-quizzes">My Quizzes</Link>
            <Link to="/quiz-reviews">Quiz Reviews</Link>
            <Link to="/instructor-messages">Student Messages</Link>
            <Link to="/contact">Contact Us</Link>
          </>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/about">About</Link>
            

            {isLoggedIn && (
              <>
                <Link to="/dashboard">My Dashboard</Link>
                <Link to="/quizzes">Quizzes</Link>
              </>
            )}
          </>
        )}
      </nav>

      <div className="header-buttons">
        {isLoggedIn ? (
          <button onClick={handleLogout} className="login-btn">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="login-btn">
              Login
            </Link>

            <Link to="/register" className="register-btn">
              Get Started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
