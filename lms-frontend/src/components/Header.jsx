
function Header() {
  return (
    <header className="header">
      <div className="logo">
        LearnHub<span>.</span>
      </div>

      <nav className="navbar">
        <a href="/">Home</a>
        <a href="/courses">Courses</a>
        <a href="/about">About</a>
      </nav>

      <div className="header-buttons">
        <a href="/login" className="login-btn">
          Login
        </a>

        <a href="/register" className="register-btn">
          Get Started
        </a>
      </div>
    </header>
  );
}

export default Header;
