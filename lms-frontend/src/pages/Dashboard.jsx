
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEnrollments,
  getPayments,
  getLessonProgress,
  getLessons,
  getQuizAttempts,
  getCourse,
  sendInstructorMessage,
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
  const [courseDetails, setCourseDetails] = useState({});
  const [activeContactCourse, setActiveContactCourse] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState("");
  const [messageError, setMessageError] = useState("");

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
      {quizAttempts.map((attempt) => {
        const isPending = attempt.review_status === "PENDING";
        const isPassed = attempt.review_status === "PASS";

        return (
          <article className="course-card" key={attempt.id}>
            <span className="course-category">QUIZ RESULT</span>

            <h3>{attempt.quiz_title || `Quiz #${attempt.quiz}`}</h3>

            {isPending ? (
              <>
                <span className="quiz-status pending">
                  PENDING REVIEW
                </span>
                <p>
                  Your quiz has been submitted successfully.
                  Your instructor will review it and award your final mark.
                </p>
              </>
            ) : (
              <>
                <p>
                  Final Awarded Mark:{" "}
                  <strong>
                    {attempt.reviewed_score ?? "Not available"}%
                  </strong>
                </p>

                <p>
                  Result:{" "}
                  <span
                    className={`quiz-status ${
                      isPassed ? "pass" : "fail"
                    }`}
                  >
                    {isPassed ? "PASS" : "FAIL"}
                  </span>
                </p>

                <p>
                  <strong>Instructor Feedback:</strong>
                </p>
                <p>
                  {attempt.instructor_feedback ||
                    "No feedback available."}
                </p>

                {attempt.reviewed_by_username && (
                  <p>
                    Reviewed by:{" "}
                    <strong>{attempt.reviewed_by_username}</strong>
                  </p>
                )}

                {attempt.reviewed_at && (
                  <p>
                    Reviewed on:{" "}
                    {new Date(attempt.reviewed_at).toLocaleDateString()}
                  </p>
                )}
              </>
            )}
          </article>
        );
      })}
    </div>
  )}
</section>

        </>
      )}
    </div>
  );
}

export default Dashboard;
