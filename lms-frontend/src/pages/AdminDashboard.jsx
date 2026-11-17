
import { Link } from "react-router-dom";

function AdminDashboard() {
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

      {/* Dashboard Statistics */}
      <section className="admin-stats">

        <article className="admin-stat-card">
          <h3>Total Students</h3>
          <h2>0</h2>
          <p>Registered students</p>
        </article>

        <article className="admin-stat-card">
          <h3>Total Instructors</h3>
          <h2>0</h2>
          <p>Registered instructors</p>
        </article>

        <article className="admin-stat-card">
          <h3>Total Courses</h3>
          <h2>0</h2>
          <p>Available courses</p>
        </article>

        <article className="admin-stat-card">
          <h3>Pending Requests</h3>
          <h2>0</h2>
          <p>Awaiting approval</p>
        </article>

      </section>

      {/* Admin Management Sections */}
      <section className="admin-management">
        <h2>Platform Management</h2>

        <div className="admin-management-grid">

          <article className="admin-management-card">
            <h3>User Management</h3>
            <p>View and manage students and instructors.</p>
            <button type="button">Manage Users</button>
          </article>

          <article className="admin-management-card">
            <h3>Course Management</h3>
            <p>Create, edit and manage SkillNest courses.</p>
            <Link to="/courses">View Courses</Link>
          </article>

          <article className="admin-management-card">
            <h3>Invitation Requests</h3>
            <p>Review and approve student and instructor applications.</p>
            <Link to="/admin/join-requests">
              Review Requests
            </Link>
          </article>

        </div>
      </section>

    </div>
  );
}

export default AdminDashboard;
