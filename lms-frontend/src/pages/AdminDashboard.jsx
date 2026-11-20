
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, {
  getAdminUsers,
  getCourses,
  getContactMessages,
} from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messagesError, setMessagesError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      setMessagesError("");

      try {
        const results = await Promise.allSettled([
          getAdminUsers(),
          getCourses(),
          api.get("auth/admin/join-requests/"),
          getContactMessages(),
        ]);

        const usersResult = results[0];
        const coursesResult = results[1];
        const requestsResult = results[2];
        const messagesResult = results[3];

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

        if (messagesResult.status === "fulfilled") {
          const data = messagesResult.value;
          setContactMessages(
            Array.isArray(data) ? data : data.results || []
          );
        } else {
          console.error("Could not load contact messages:", messagesResult.reason);
          setMessagesError("Could not load contact messages. Please check your login.");
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

  const unreadMessages = contactMessages.filter(
    (message) => !message.is_read
  ).length;

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

        <article className="admin-stat-card">
          <h3>Unread Messages</h3>
          <h2>{loading ? "..." : unreadMessages}</h2>
          <p>Contact enquiries awaiting attention</p>
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

          <article className="admin-management-card">
            <h3>Contact Messages</h3>
            <p>
              View enquiries and messages submitted through the Contact Us page.
            </p>
            <a href="#contact-messages">View Messages ({contactMessages.length})</a>
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

      {/* Contact Messages */}
      <section className="admin-management" id="contact-messages">
        <h2>Contact Messages ({contactMessages.length})</h2>

        {loading ? (
          <p>Loading contact messages...</p>
        ) : messagesError ? (
          <p className="error-message">{messagesError}</p>
        ) : contactMessages.length === 0 ? (
          <p>No contact messages have been received yet.</p>
        ) : (
          <div className="admin-management-grid">
            {contactMessages.map((message) => (
              <article className="admin-management-card" key={message.id}>
                <h3>{message.subject}</h3>

                <p>
                  <strong>From:</strong> {message.name}
                </p>

                <p>
                  <strong>Email:</strong> {message.email}
                </p>

                <p>
                  <strong>Message:</strong>
                </p>

                <p>{message.message}</p>

                <p>
                  <strong>Received:</strong>{" "}
                  {new Date(message.created_at).toLocaleString()}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {message.is_read ? "Read" : "Unread"}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
