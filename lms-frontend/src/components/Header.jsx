
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const isLoggedIn = Boolean(localStorage.getItem("access_token"));

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const isReviewer =
    user?.is_staff || user?.role === "INSTRUCTOR";

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
        {isReviewer ? (
          <Link to="/quiz-reviews">Quiz Reviews</Link>
        ) : (
          <>
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
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
