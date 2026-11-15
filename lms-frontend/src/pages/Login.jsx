import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

const registrationSuccess = location.state?.registrationSuccess;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
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
      <div className="auth-card">
        <h1>Welcome Back!</h1>
        <p>Login to continue learning with LearnHub.</p>

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
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="auth-link">
  <p>
    Don't have a SkillNest account yet?
  </p>

  <p>
    You need an invitation from our administrator before you can register.
  </p>

  <Link to="/join">Request an Invitation</Link>
</div>
      </div>
    </div>
  );
}

export default Login;