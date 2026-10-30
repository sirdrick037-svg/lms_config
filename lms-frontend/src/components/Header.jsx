
import { Link, useNavigate, useLocation } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  // Re-render the header whenever the route changes
  useLocation();

  const isLoggedIn = Boolean(
    localStorage.getItem("access_token")
  );

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    navigate("/login");
  };

  return (
    <header className="header">
      <Link to="/" className="logo">
        LearnHub<span>.</span>
      </Link>

      <nav className="navbar">
        <Link to="/">Home</Link>
        <Link to="/courses">Courses</Link>
        <Link to="/about">About</Link>
      </nav>

      <div className="header-buttons">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="login-btn"
          >
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
