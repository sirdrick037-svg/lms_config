
import { useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [studentName] = useState(
    localStorage.getItem("student_name") || "Student"
  );

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <span>STUDENT DASHBOARD</span>
        <h1>Welcome back, {studentName}!</h1>
        <p>Continue learning and building your future with SkillNest.</p>
      </section>

      <section className="dashboard-stats">
        <article className="dashboard-card">
          <h3>My Courses</h3>
          <h2>0</h2>
          <p>Enrolled courses</p>
        </article>

        <article className="dashboard-card">
          <h3>Completed</h3>
          <h2>0</h2>
          <p>Completed courses</p>
        </article>

        <article className="dashboard-card">
          <h3>Payments</h3>
          <h2>0</h2>
          <p>Successful payments</p>
        </article>
      </section>

      <section className="dashboard-content">
        <div>
          <h2>My Learning</h2>
          <p>You haven't enrolled in any courses yet.</p>
          <Link to="/courses" className="dashboard-btn">
            Explore Courses
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
