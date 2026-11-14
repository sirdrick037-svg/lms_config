
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
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email Address</label>
        <input
          type="email"
          name="email"
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
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Request Invitation"}
        </button>
      </form>
    </div>
  );
}

export default JoinRequest;
