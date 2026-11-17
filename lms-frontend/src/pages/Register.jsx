
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function EyeIcon({ visible }) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!visible && <path d="M3 3l18 18" />}
    </svg>
  );
}

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Your passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registrationData } = formData;

      await registerUser(registrationData);

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      const errors = error.response?.data;

      setError(
        errors?.email?.[0] ||
        errors?.username?.[0] ||
        errors?.password?.[0] ||
        errors?.detail ||
        "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Complete Your Registration</h1>
        <p>Welcome to SkillNest! Enter your details below to create your account.</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Choose a Username</label>
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            autoComplete="username"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />

          <label>Create a Password</label>
          <div className="password-input-wrap">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create password (minimum 8 characters)"
              value={formData.password}
              onChange={handleChange}
              minLength={8}
              autoComplete="new-password"
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

          <label>Confirm Your Password</label>
          <div className="password-input-wrap">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Enter your password again"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              <EyeIcon visible={showConfirmPassword} />
            </button>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating Account..." : "Create My Account"}
          </button>
        </form>

        <p className="auth-link">
          Already have a SkillNest account? <Link to="/login">Login</Link>
        </p>

        <p className="auth-link">
          Need an invitation? Contact your administrator.
        </p>
      </div>
    </div>
  );
}

export default Register;
