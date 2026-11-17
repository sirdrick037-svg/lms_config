
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";

function EyeIcon({ visible }) {
  return visible ? (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 3 18 18" />
      <path d="M10.6 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a15.5 15.5 0 0 1-4 4.8" />
      <path d="M6.6 6.6C3.6 8.5 2 12 2 12s3.5 7 10 7c1.3 0 2.5-.3 3.6-.8" />
    </svg>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginUser(email, password);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.is_staff) {
        navigate("/admin/join-requests");
      } else if (data.user?.role === "INSTRUCTOR") {
        navigate("/quiz-reviews");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError("Login failed. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

<div className="auth-intro">
  <h1 className="auth-brand">
    Skill<span>Nest</span>
  </h1>

  <p className="auth-tagline">LEARN • PRACTICE • GROW</p>

  <div className="auth-intro-content">
    <h2>Welcome to SkillNest</h2>

    <p>
      Your journey to knowledge, skills and new opportunities
      starts here.
    </p>

    <div className="auth-benefits">
      <p>✓ Access quality learning materials</p>
      <p>✓ Learn at your own pace</p>
      <p>✓ Take quizzes and track your progress</p>
      <p>✓ Build skills for your future</p>
    </div>

    <h3>Learn Today. Lead Tomorrow.</h3>
  </div>
</div>

      <div className="auth-card">
        <h1>Welcome Back!</h1>
        <p>Log in to continue learning with SkillNest.</p>

        {error && <p className="error-message">{error}</p>}

        {registrationSuccess && (
          <p className="success-message">
            Registration successful! Your SkillNest account has been created.
            Please log in using your new email and password.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          <label>Confirm Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmation password"
                  : "Show confirmation password"
              }
            >
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-link">
          <p>Don't have a SkillNest account yet?</p>
          <p>
            You need an invitation from our administrator before you can
            register.
          </p>
          <Link to="/join">Request an Invitation</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
