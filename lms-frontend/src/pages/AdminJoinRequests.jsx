
import { useEffect, useState } from "react";

function AdminJoinRequests() {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const [roles, setRoles] = useState({});
  const [selectedCourses, setSelectedCourses] = useState({});
  const [adminNotes, setAdminNotes] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});

  const token = localStorage.getItem("access_token");

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/admin/join-requests/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to load invitation requests.");
      }

      setRequests(data.results || data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/courses/",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load courses.");
      }

      setCourses(data.results || data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchCourses();
  }, []);

  const handleRoleChange = (requestId, role) => {
    setRoles((prev) => ({
      ...prev,
      [requestId]: role,
    }));

    setReviewErrors((prev) => ({
      ...prev,
      [requestId]: "",
    }));
  };

  const handleCourseChange = (requestId, courseId) => {
    setSelectedCourses((prev) => {
      const current = prev[requestId] || [];

      const updated = current.includes(courseId)
        ? current.filter((id) => id !== courseId)
        : [...current, courseId];

      return {
        ...prev,
        [requestId]: updated,
      };
    });
  };

  const handleReview = async (requestId, action) => {
    const role = roles[requestId];
    const courseIds = selectedCourses[requestId] || [];
    const notes = adminNotes[requestId] || "";

    if (action === "approve" && !role) {
      setReviewErrors((prev) => ({
        ...prev,
        [requestId]: "Please select the applicant's role.",
      }));
      return;
    }

    if (
      action === "approve" &&
      role === "INSTRUCTOR" &&
      courseIds.length === 0
    ) {
      setReviewErrors((prev) => ({
        ...prev,
        [requestId]: "Please select at least one course.",
      }));
      return;
    }

    setReviewingId(requestId);

    try {
      const payload = {
        action,
        admin_notes: notes,
      };

      if (action === "approve") {
        payload.role = role;
        payload.course_ids = role === "INSTRUCTOR" ? courseIds : [];
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/auth/admin/join-requests/${requestId}/review/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.role?.[0] ||
          data.course_ids?.[0] ||
          "Unable to review this request."
        );
      }

      alert(data.detail);
      await fetchRequests();

    } catch (err) {
      setReviewErrors((prev) => ({
        ...prev,
        [requestId]: err.message,
      }));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="admin-join-requests">
      <h1>Invitation Requests</h1>

      <p>
        Review requests from people who want to join SkillNest.
      </p>

      {loading && <p>Loading requests...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && requests.length === 0 && (
        <p>No invitation requests found.</p>
      )}

      {requests.map((request) => (
        <div key={request.id} className="request-card">

          <h3>{request.name}</h3>

          <p>
            <strong>Email:</strong> {request.email}
          </p>

          <p>
            <strong>Requested role:</strong> {request.requested_role}
          </p>

          <p>
            <strong>Message:</strong> {request.message}
          </p>

          <p>
            <strong>Status:</strong> {request.status}
          </p>

          <p>
            <strong>Submitted:</strong>{" "}
            {new Date(request.submitted_at).toLocaleString()}
          </p>

          {request.status === "PENDING" && (
            <div className="request-review">

              <hr />

              <h4>Administrator Review</h4>

              <label>
                Assign role:
              </label>

              <select
                value={roles[request.id] || ""}
                onChange={(e) =>
                  handleRoleChange(request.id, e.target.value)
                }
              >
                <option value="">Select role</option>
                <option value="STUDENT">Student</option>
                <option value="INSTRUCTOR">Instructor</option>
              </select>

              {roles[request.id] === "INSTRUCTOR" && (
                <div>
                  <h4>Select courses for this instructor</h4>

                  {courses.length === 0 && (
                    <p>No courses available.</p>
                  )}

                  {courses.map((course) => (
                    <label
                      key={course.id}
                      style={{
                        display: "block",
                        margin: "8px 0",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={(selectedCourses[request.id] || []).includes(
                          course.id
                        )}
                        onChange={() =>
                          handleCourseChange(request.id, course.id)
                        }
                      />

                      {" "}{course.title}
                    </label>
                  ))}
                </div>
              )}

              <label>
                Message to applicant:
              </label>

              <textarea
                value={adminNotes[request.id] || ""}
                onChange={(e) =>
                  setAdminNotes((prev) => ({
                    ...prev,
                    [request.id]: e.target.value,
                  }))
                }
                placeholder="Enter an optional message..."
                rows="3"
              />

              {reviewErrors[request.id] && (
                <p className="error-message">
                  {reviewErrors[request.id]}
                </p>
              )}

              <div className="review-buttons">

                <button
                  type="button"
                  disabled={reviewingId === request.id}
                  onClick={() => handleReview(request.id, "approve")}
                >
                  {reviewingId === request.id
                    ? "Please wait..."
                    : "Approve"}
                </button>

                <button
                  type="button"
                  disabled={reviewingId === request.id}
                  onClick={() => handleReview(request.id, "reject")}
                >
                  {reviewingId === request.id
                    ? "Please wait..."
                    : "Reject"}
                </button>

              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default AdminJoinRequests;
