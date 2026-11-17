
import { useState } from "react";

function JoinRequest() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    requested_role: "STUDENT",
    message: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/join-requests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Object.values(data).flat().join(" ") ||
          "Unable to submit your request."
        );
      }

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        requested_role: "STUDENT",
        message: "",
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-request-page">

      {/* LEFT SKILLNEST INFORMATION PANEL */}
      <div className="join-intro">
        <h1 className="join-brand">
          Skill<span>Nest</span>
        </h1>

        <p className="join-tagline">
          LEARN • PRACTICE • GROW
        </p>

        <div className="join-intro-content">
          <span className="join-eyebrow">
            YOUR LEARNING COMMUNITY
          </span>

          <h2>
            Your Journey to Knowledge Starts Here.
          </h2>

          <p>
            Take the first step towards joining SkillNest.
            Request an invitation and become part of a
            community dedicated to learning, growth and success.
          </p>

          <div className="join-benefits">
            <p>✓ Access quality learning materials</p>
            <p>✓ Develop valuable skills</p>
            <p>✓ Learn at your own pace</p>
            <p>✓ Grow with a supportive community</p>
          </div>

          <h3>Learn Today. Lead Tomorrow.</h3>
        </div>
      </div>

      {/* RIGHT INVITATION FORM */}
      <div className="join-request-container">
        <h1>Request an Invitation</h1>

        <p>
          Interested in joining SkillNest? Submit your request below.
          Once approved by our administrator, you will receive an
          invitation email to complete your registration.
        </p>

        {success && (
          <div className="success-toast">
            <span className="success-icon">✓</span>
            <div>
              <strong>Invitation request sent successfully!</strong>
              <p>
                Your request has been received. Please check your email
                for confirmation and wait for the administrator's decision.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSuccess(false)}
              aria-label="Close message"
            >
              ×
            </button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
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

          <label>I want to join as</label>
          <select
            name="requested_role"
            value={formData.requested_role}
            onChange={handleChange}
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>

          <label>Why do you want to join SkillNest?</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="5"
            placeholder="Tell us a little about yourself and why you want to join..."
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Request Invitation"}
          </button>
        </form>

        <p className="join-note">
          Your request will be reviewed by a SkillNest administrator.
        </p>
      </div>
    </div>
  );
}

export default JoinRequest;
