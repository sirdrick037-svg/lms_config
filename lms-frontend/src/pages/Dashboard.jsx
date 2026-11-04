
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEnrollments,
  getPayments,
  getLessonProgress,
} from "../services/api";

function Dashboard() {
  const [studentName] = useState(
    localStorage.getItem("student_name") || "Student"
  );

  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrollmentData, paymentData, progressData] =
          await Promise.all([
            getEnrollments(),
            getPayments(),
            getLessonProgress(),
          ]);

        setEnrollments(enrollmentData.results || enrollmentData);
        setPayments(paymentData.results || paymentData);
        setProgress(progressData.results || progressData);
      } catch (err) {
        setError(
          "Unable to load dashboard information. Please log in again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const completedCourses = enrollments.filter((enrollment) => {
    const courseProgress = progress.filter(
      (item) => item.enrollment === enrollment.id
    );

    return (
      courseProgress.length > 0 &&
      courseProgress.every((item) => item.is_completed)
    );
  }).length;

  const getCourseProgress = (enrollmentId) => {
  const courseProgress = progress.filter(
    (item) => item.enrollment === enrollmentId
  );

  if (courseProgress.length === 0) {
    return {
      completed: 0,
      total: 0,
      percentage: 0,
    };
  }

  const completed = courseProgress.filter(
    (item) => item.is_completed
  ).length;

  return {
    completed,
    total: courseProgress.length,
    percentage: Math.round(
      (completed / courseProgress.length) * 100
    ),
  };
};

  const successfulPayments = payments.filter(
    (payment) => payment.status === "SUCCESS"
  ).length;

  if (loading) {
    return <p>Loading your dashboard...</p>;
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome">
        <span>STUDENT DASHBOARD</span>
        <h1>Welcome back, {studentName}!</h1>
        <p>
          Continue learning and building your future with SkillNest.
        </p>
      </section>

      {error && <p className="error-message">{error}</p>}

      {!error && (
        <>
          <section className="dashboard-stats">
            <article className="dashboard-card">
              <h3>My Courses</h3>
              <h2>{enrollments.length}</h2>
              <p>Enrolled courses</p>
            </article>

            <article className="dashboard-card">
              <h3>Completed</h3>
              <h2>{completedCourses}</h2>
              <p>Completed courses</p>
            </article>

            <article className="dashboard-card">
              <h3>Payments</h3>
              <h2>{successfulPayments}</h2>
              <p>Successful payments</p>
            </article>
          </section>

          <section className="dashboard-content">
            <h2>My Learning</h2>

            {enrollments.length === 0 ? (
              <>
                <p>You haven't enrolled in any courses yet.</p>
                <Link to="/courses" className="dashboard-btn">
                  Explore Courses
                </Link>
              </>
            ) : (
              <div className="courses-grid">
                {enrollments.map((enrollment) => (
                  <article
                    className="course-card"
                    key={enrollment.id}
                  >
                    <span className="course-category">
                      MY LEARNING
                    </span>

                    <h3>{enrollment.course_title}</h3>

                    <p>
                      Enrolled on:{" "}
                      {new Date(
                        enrollment.enrolled_at
                      ).toLocaleDateString()}
                    </p>

                    <div className="course-card-bottom">
                      <span>Enrolled</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
