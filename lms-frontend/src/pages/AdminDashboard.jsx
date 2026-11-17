
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getAdminUsers, getCourses } from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const results = await Promise.allSettled([
          getAdminUsers(),
          getCourses(),
          api.get("auth/admin/join-requests/"),
        ]);

        const usersResult = results[0];
        const coursesResult = results[1];
        const requestsResult = results[2];

        if (usersResult.status === "fulfilled") {
          const data = usersResult.value;
          setUsers(Array.isArray(data) ? data : data.results || []);
        } else {
          console.error("Could not load users:", usersResult.reason);
          setError("Could not load registered users. Please check your login.");
        }

        if (coursesResult.status === "fulfilled") {
          const data = coursesResult.value;
          setCourses(Array.isArray(data) ? data : data.results || []);
        } else {
          console.error("Could not load courses:", coursesResult.reason);
        }

        if (requestsResult.status === "fulfilled") {
          const data = requestsResult.value.data;
          const requests = Array.isArray(data) ? data : data.results || [];

          setPendingRequests(
            requests.filter((request) => request.status === "PENDING").length
          );
        } else {
          console.error("Could not load join requests:", requestsResult.reason);
        }
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Something went wrong while loading the dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const students = users.filter((user) => user.role === "STUDENT");
  const instructors = users.filter((user) => user.role === "INSTRUCTOR");

  const displayName = (user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    return fullName || user.username;
  };

  return (
    <div className="admin-dashboard">
      {/* Welcome Section */}
      <section className="admin-welcome">
        <span>SKILLNEST ADMINISTRATION</span>
        <h1>Welcome, Administrator!</h1>
        <p>
          Manage your learning platform, users, courses and applications
          from one place.
        </p>
      </section>

      {error && <p className="error-message">{error}</p>}

      {/* Dashboard Statistics */}
      <section className="admin-stats">
        <article className="admin-stat-card">
          <h3>Total Students</h3>
          <h2>{loading ? "..." : students.length}</h2>
          <p>Registered students</p>
        </article>

        <article className="admin-stat-card">
          <h3>Total Instructors</h3>
          <h2>{loading ? "..." : instructors.length}</h2>
          <p>Registered instructors</p>
        </article>

        <article className="admin-stat-card">
          <h3>Total Courses</h3>
          <h2>{loading ? "..." : courses.length}</h2>
          <p>Available courses</p>
        </article>

        <article className="admin-stat-card">
          <h3>Pending Requests</h3>
          <h2>{loading ? "..." : pendingRequests}</h2>
          <p>Awaiting approval</p>
        </article>
      </section>

      {/* Admin Management Sections */}
      <section className="admin-management">
        <h2>Platform Management</h2>

        <div className="admin-management-grid">
          <article className="admin-management-card">
            <h3>User Management</h3>
            <p>View registered students and instructors.</p>
            <a href="#registered-users">Manage Users</a>
          </article>

          <article className="admin-management-card">
            <h3>Course Management</h3>
            <p>Create, edit and manage SkillNest courses.</p>
            <Link to="/courses">View Courses</Link>
          </article>

          <article className="admin-management-card">
            <h3>Invitation Requests</h3>
            <p>Review and approve student and instructor applications.</p>
            <Link to="/admin/join-requests">Review Requests</Link>
          </article>
        </div>
      </section>

      {/* Registered Users */}
      <section className="admin-management" id="registered-users">
        <h2>Registered Users</h2>

        {loading ? (
          <p>Loading registered users...</p>
        ) : (
          <div className="admin-management-grid">
            <article className="admin-management-card">
              <h3>Registered Students ({students.length})</h3>

              {students.length === 0 ? (
                <p>No registered students found.</p>
              ) : (
                <ul>
                  {students.map((student) => (
                    <li key={student.id}>
                      <strong>{displayName(student)}</strong>
                      <br />
                      <span>{student.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="admin-management-card">
              <h3>Registered Instructors ({instructors.length})</h3>

              {instructors.length === 0 ? (
                <p>No registered instructors found.</p>
              ) : (
                <ul>
                  {instructors.map((instructor) => (
                    <li key={instructor.id}>
                      <strong>{displayName(instructor)}</strong>
                      <br />
                      <span>{instructor.email}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
