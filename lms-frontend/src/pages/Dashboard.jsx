
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEnrollments,
  getPayments,
  getLessonProgress,
  getLessons,
  getQuizAttempts,
} from "../services/api";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

const studentName =
  user?.first_name || user?.username || "Student";

const studentEmail = user?.email || "No email available";

const studentInitial = studentName.charAt(0).toUpperCase();

  const [enrollments, setEnrollments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrollmentData, paymentData, progressData, quizAttemptData] =
          await Promise.all([
            getEnrollments(),
            getPayments(),
            getLessonProgress(),
            getQuizAttempts(),
          ]);

        const enrollmentList =
          enrollmentData.results || enrollmentData;

        const lessonData = await Promise.all(
          enrollmentList.map((enrollment) =>
            getLessons(enrollment.course)
          )
        );

        const allLessons = lessonData.flatMap((data) =>
          data.results || data
        );

        setEnrollments(enrollmentList);
        setPayments(paymentData.results || paymentData);
        setProgress(progressData.results || progressData);
        setLessons(allLessons);
        setQuizAttempts(quizAttemptData.results || quizAttemptData);
      } catch (err) {
        console.error("Dashboard error:", err);

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
    const courseLessons = lessons.filter(
      (lesson) => lesson.course === enrollment.course
    );

    if (courseLessons.length === 0) {
      return false;
    }

    const completedCount = courseLessons.filter((lesson) =>
      progress.some(
        (item) =>
          item.enrollment === enrollment.id &&
          item.lesson === lesson.id &&
          item.is_completed
      )
    ).length;

    return completedCount === courseLessons.length;
  }).length;

  const successfulPayments = payments.filter(
    (payment) => payment.status === "SUCCESS"
  ).length;

  const getCourseProgress = (enrollmentId, courseId) => {
    const courseLessons = lessons.filter(
      (lesson) => lesson.course === courseId
    );

    const completed = courseLessons.filter((lesson) =>
      progress.some(
        (item) =>
          item.enrollment === enrollmentId &&
          item.lesson === lesson.id &&
          item.is_completed
      )
    ).length;

    const total = courseLessons.length;

    return {
      completed,
      total,
      percentage:
        total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

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
  <article className="dashboard-card stats-courses">
    <div className="stats-icon"></div>
    <h3>My Courses</h3>
    <h2>{enrollments.length}</h2>
    <p>Enrolled courses</p>
  </article>

  <article className="dashboard-card stats-completed">
    <div className="stats-icon"></div>
    <h3>Completed</h3>
    <h2>{completedCourses}</h2>
    <p>Courses completed</p>
  </article>

  <article className="dashboard-card stats-payments">
    <div className="stats-icon"></div>
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
                {enrollments.map((enrollment) => {
                  const courseStats = getCourseProgress(
                    enrollment.id,
                    enrollment.course
                  );

                  return (
                    <article
                      className="course-card"
                      key={enrollment.id}
                    >
                      <span className="course-category">
  MY LEARNING
</span>

<span
  className={`course-completion-badge ${
    courseStats.percentage === 100 ? "completed" : "in-progress"
  }`}
>
  {courseStats.percentage === 100 ? "✓ COMPLETED" : "IN PROGRESS"}
</span>

                      <h3>{enrollment.course_title}</h3>

                      <p>
                        Enrolled on:{" "}
                        {new Date(
                          enrollment.enrolled_at
                        ).toLocaleDateString()}
                      </p>

                      <div className="course-progress">
                        <div className="progress-info">
                          <span>Learning Progress</span>
                          <strong>
                            {courseStats.percentage}%
                          </strong>
                        </div>

                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${courseStats.percentage}%`,
                            }}
                          ></div>
                        </div>

                        <p>
                          {courseStats.completed} of{" "}
                          {courseStats.total} lessons completed
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
          <section className="dashboard-content">
  <h2>My Quiz Results</h2>

  {quizAttempts.length === 0 ? (
    <p>You haven't attempted any quizzes yet.</p>
  ) : (
    <div className="courses-grid">
      {quizAttempts.map((attempt) => (
        <article className="course-card" key={attempt.id}>
          <span className="course-category">QUIZ RESULT</span>

          <h3>{attempt.quiz_title || `Quiz #${attempt.quiz}`}</h3>

          <p>
            Score: <strong>{attempt.score}%</strong>
          </p>

          <p>
  Review Status:{" "}
  <span
    className={`quiz-status ${(attempt.review_status || "PENDING").toLowerCase()}`}
  >
    {attempt.review_status === "PASS"
      ? "APPROVED"
      : attempt.review_status === "FAIL"
      ? "REJECTED"
      : "PENDING"}
  </span>
</p>

<p>
  Final Result:{" "}
  <strong>
    {attempt.review_status === "PENDING"
      ? "Awaiting instructor review"
      : attempt.review_status === "PASS"
      ? "Congratulations! Your quiz was approved."
      : "Your quiz was rejected. Please contact your instructor."}
  </strong>
</p>

{attempt.reviewed_by_username && (
  <p>
    Reviewed by: <strong>{attempt.reviewed_by_username}</strong>
  </p>
)}
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
