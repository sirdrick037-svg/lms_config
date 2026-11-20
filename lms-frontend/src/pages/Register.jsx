
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

function EyeIcon({ crossed = false }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {crossed ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 002.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.1-2.2 3" />
          <path d="M6.2 6.2C3.8 7.7 2.5 10 2 12c.7 2 4.2 7 10 7 1.1 0 2.1-.2 3-.5" />
        </>
      ) : (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    account_type: "STUDENT",
    application_message: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (formData.password !== confirmPassword) {
      setError("Your passwords do not match. Please check them.");
      return;
    }

    if (
      formData.account_type === "INSTRUCTOR" &&
      !formData.application_message.trim()
    ) {
      setError("Please tell us why you want to become an instructor.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(formData);

      if (formData.account_type === "INSTRUCTOR") {
        setSuccess(
          "Your instructor application has been submitted successfully. " +
          "An administrator will review your application. " +
          "You will be notified once a decision has been made."
        );
      } else {
        navigate("/login", {
          state: { registrationSuccess: true },
        });
      }
    } catch (error) {
      console.error("Registration error:", error.response?.data);

      const errors = error.response?.data;

      setError(
        errors?.email?.[0] ||
        errors?.username?.[0] ||
        errors?.password?.[0] ||
        errors?.application_message?.[0] ||
        errors?.account_type?.[0] ||
        errors?.detail ||
        "Registration failed. Please try again."
      );
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
          <h2>Start Your Learning Journey</h2>

          <p>
            Join SkillNest and take the next step towards
            building your knowledge and developing valuable skills.
          </p>

          <div className="auth-benefits">
            <p>✓ Explore quality learning materials</p>
            <p>✓ Learn at your own pace</p>
            <p>✓ Complete quizzes and track progress</p>
            <p>✓ Work towards your learning goals</p>
          </div>

          <h3>Your Future Starts Here.</h3>
        </div>
      </div>

      <div className="auth-card">
        <h1>Create Your Account</h1>
        <p>Join SkillNest and take the next step in your learning journey.</p>

        {error && <p className="error-message">{error}</p>}

        {success && (
          <div className="success-message">
            <p>{success}</p>
            <Link to="/login">Go to Login</Link>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Account Type</label>
            <select
              name="account_type"
              value={formData.account_type}
              onChange={handleChange}
              required
            >
              <option value="STUDENT">Student</option>
              <option value="INSTRUCTOR">Instructor</option>
            </select>

            {formData.account_type === "INSTRUCTOR" && (
              <>
                <label>Why would you like to become an instructor?</label>
                <textarea
                  name="application_message"
                  placeholder="Tell us briefly about your teaching experience, skills or areas of expertise."
                  value={formData.application_message}
                  onChange={handleChange}
                  rows={4}
                  required
                />
                <p>
                  Your application will be reviewed by a SkillNest administrator.
                </p>
              </>
            )}

            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password (minimum 8 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon crossed={!showPassword} />
              </button>
            </div>

            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Enter your password again"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmation password"
                    : "Show confirmation password"
                }
              >
                <EyeIcon crossed={!showConfirmPassword} />
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading
                ? "Submitting..."
                : formData.account_type === "INSTRUCTOR"
                  ? "Submit Application"
                  : "Create Account"}
            </button>
          </form>
        )}

        <div className="auth-link">
          <p>Already have a SkillNest account?</p>
          <Link to="/login">Log in here</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
