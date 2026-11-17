
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  enrollInCourse,
  initiatePayment,
  getPayments,
  getEnrollments,
  getLessonProgress,
  markLessonCompleted,
} from "../services/api";

function CourseDetails() {
  const { id } = useParams();

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = Boolean(user?.is_staff);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState([]);
  const [enrollmentId, setEnrollmentId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseResponse = await fetchCourse(id);
        setCourse(courseResponse);

        // Administrators only need a course preview.
        if (isAdmin) {
          return;
        }

        const enrollmentResponse = await getEnrollments();
        const enrollments =
          enrollmentResponse.results || enrollmentResponse;

        const alreadyEnrolled = enrollments.some(
          (enrollment) =>
            Number(enrollment.course) === Number(id)
        );

        setIsEnrolled(alreadyEnrolled);

        if (alreadyEnrolled) {
          const currentEnrollment = enrollments.find(
            (enrollment) =>
              Number(enrollment.course) === Number(id)
          );

          setEnrollmentId(currentEnrollment.id);

          const lessonsResponse = await fetchLessons(id);
          setLessons(
            lessonsResponse.results || lessonsResponse
          );

          const progressResponse = await getLessonProgress();
          const progressList =
            progressResponse.results || progressResponse;

          setProgress(
            progressList.filter(
              (item) =>
                Number(item.enrollment) ===
                Number(currentEnrollment.id)
            )
          );
        }
      } catch (err) {
        console.error("Course details error:", err);
        setError(
          "Unable to load course details. Please log in and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  // Load lessons after successful enrollment.
  const unlockLessons = async () => {
    try {
      const enrollmentResponse = await getEnrollments();
      const enrollmentList =
        enrollmentResponse.results || enrollmentResponse;

      const currentEnrollment = enrollmentList.find(
        (enrollment) =>
          Number(enrollment.course) === Number(id)
      );

      if (!currentEnrollment) {
        setMessage("Your enrollment could not be found.");
        return;
      }

      setEnrollmentId(currentEnrollment.id);

      const lessonsResponse = await fetchLessons(id);
      setLessons(
        lessonsResponse.results || lessonsResponse
      );

      const progressResponse = await getLessonProgress();
      const progressList =
        progressResponse.results || progressResponse;

      setProgress(
        progressList.filter(
          (item) =>
            Number(item.enrollment) ===
            Number(currentEnrollment.id)
        )
      );

      setIsEnrolled(true);
    } catch (error) {
      console.error("Unlock lessons error:", error);
      setMessage(
        "Unable to load your lessons. Please try again."
      );
    }
  };

  // Mark a lesson as completed.
  const handleMarkCompleted = async (lessonId) => {
    try {
      await markLessonCompleted(enrollmentId, lessonId);

      const progressResponse = await getLessonProgress();
      const progressList =
        progressResponse.results || progressResponse;

      setProgress(
        progressList.filter(
          (item) =>
            Number(item.enrollment) === Number(enrollmentId)
        )
      );

      setMessage("Lesson marked as completed!");
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          "Unable to update lesson progress. Please try again."
      );
    }
  };

  // Free course enrollment.
  const handleFreeEnrollment = async () => {
    setEnrolling(true);
    setMessage("");

    try {
      await enrollInCourse(Number(id));
      await unlockLessons();

      setMessage(
        "Congratulations! You have successfully enrolled. Your lessons are now available."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          "Unable to enroll. Please log in and try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  // Start M-Pesa payment.
  const handlePayment = async () => {
    if (!phoneNumber.trim()) {
      setMessage("Please enter your phone number.");
      return;
    }

    setEnrolling(true);
    setMessage("");

    try {
      await initiatePayment(Number(id), phoneNumber);

      setPaymentSent(true);

      setMessage(
        "Payment request submitted. Please check your phone for an M-PESA prompt."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          "Unable to start payment. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  // Check payment and enroll.
  const handleCheckPayment = async () => {
    setEnrolling(true);
    setMessage("");

    try {
      const response = await getPayments();
      const payments = response.results || response;

      const successfulPayment = payments.find(
        (payment) =>
          Number(payment.course) === Number(id) &&
          payment.status === "SUCCESS"
      );

      if (!successfulPayment) {
        setMessage(
          "Payment has not been confirmed yet. Please wait and try again."
        );
        return;
      }

      await enrollInCourse(Number(id));
      await unlockLessons();

      setMessage(
        "Payment confirmed! You have successfully enrolled. Your lessons are now available."
      );
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
          "Unable to complete enrollment. Please try again."
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <p>Loading course details...</p>;
  if (error) return <p>{error}</p>;
  if (!course) return <p>Course not found.</p>;

  const isFree = Number(course.price) === 0;

  // ADMINISTRATOR COURSE PREVIEW
  if (isAdmin) {
    const assignedInstructors =
      course.instructors_details || [];

    return (
      <div className="course-details-page">
        <div className="course-details-card">
          <p className="course-details-label">
            ADMIN COURSE PREVIEW
          </p>

          <h1>{course.title}</h1>

          <p className="course-details-description">
            {course.description}
          </p>

          <div className="course-details-info">
            <p>
              <strong>Assigned Instructor(s):</strong>
            </p>

            {assignedInstructors.length > 0 ? (
              <ul>
                {assignedInstructors.map((instructor) => (
                  <li key={instructor.id}>
                    {instructor.first_name ||
                    instructor.last_name
                      ? `${instructor.first_name || ""} ${
                          instructor.last_name || ""
                        }`.trim()
                      : instructor.username}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No instructors assigned yet.</p>
            )}

            <p>
              <strong>Price:</strong>{" "}
              {isFree
                ? "Free"
                : `KSh ${Number(
                    course.price
                  ).toLocaleString("en-KE")}`}
            </p>

            <p>
              <strong>Publication Status:</strong>{" "}
              {course.is_published
                ? "Published"
                : "Not published"}
            </p>
          </div>

          <Link to="/courses" className="login-btn">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  // STUDENT COURSE VIEW
  return (
    <div className="course-details-page">
      <div className="course-details-card">
        <p className="course-details-label">
          COURSE DETAILS
        </p>

        <h1>{course.title}</h1>

        <p className="course-details-description">
          {course.description}
        </p>

        <div className="course-details-info">
          <p>
            <strong>Instructor:</strong>{" "}
            {course.instructors_details?.length
              ? course.instructors_details
                  .map((instructor) =>
                    instructor.first_name ||
                    instructor.last_name
                      ? `${instructor.first_name || ""} ${
                          instructor.last_name || ""
                        }`.trim()
                      : instructor.username
                  )
                  .join(", ")
              : course.instructor_username}
          </p>

          <p>
            <strong>Price:</strong>{" "}
            {isFree
              ? "Free"
              : `KSh ${Number(
                  course.price
                ).toLocaleString("en-KE")}`}
          </p>

          {isEnrolled && (
            <p>
              <strong>Total Lessons:</strong>{" "}
              {lessons.length}
            </p>
          )}
        </div>

        <hr />

        {!isEnrolled ? (
          <>
            <h2>Join This Course</h2>

            {isFree ? (
              <button
                className="enroll-btn"
                onClick={handleFreeEnrollment}
                disabled={enrolling}
              >
                {enrolling
                  ? "Please wait..."
                  : "Enroll Now"}
              </button>
            ) : (
              <div className="payment-section">
                <p>
                  Pay KSh{" "}
                  {Number(
                    course.price
                  ).toLocaleString("en-KE")}{" "}
                  using M-Pesa to unlock this course.
                </p>

                <label htmlFor="phoneNumber">
                  M-Pesa Phone Number
                </label>

                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="e.g. 0712345678"
                  value={phoneNumber}
                  onChange={(e) =>
                    setPhoneNumber(e.target.value)
                  }
                  disabled={paymentSent}
                />

                {!paymentSent ? (
                  <button
                    className="enroll-btn"
                    onClick={handlePayment}
                    disabled={enrolling}
                  >
                    {enrolling
                      ? "Please wait..."
                      : "Pay with M-Pesa"}
                  </button>
                ) : (
                  <button
                    className="enroll-btn"
                    onClick={handleCheckPayment}
                    disabled={enrolling}
                  >
                    {enrolling
                      ? "Checking..."
                      : "Check Payment & Enroll"}
                  </button>
                )}
              </div>
            )}

            <p>
              Enroll in this course to access the lessons.
            </p>
          </>
        ) : (
          <>
            <h2>Course Curriculum</h2>

            {lessons.length > 0 ? (
              <div className="course-lessons-list">
                {[...lessons]
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, index) => (
                    <div
                      className="course-lesson-item"
                      key={lesson.id}
                    >
                      <div>
                        <span>Lesson {index + 1}</span>
                        <h3>{lesson.title}</h3>
                        <p>{lesson.content}</p>

                        {progress.some(
                          (item) =>
                            Number(item.lesson) ===
                              Number(lesson.id) &&
                            item.is_completed
                        ) ? (
                          <button
                            className="enroll-btn"
                            disabled
                          >
                            Completed ✓
                          </button>
                        ) : (
                          <button
                            className="enroll-btn"
                            onClick={() =>
                              handleMarkCompleted(lesson.id)
                            }
                          >
                            Mark as Completed
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>
                No lessons have been added to this course yet.
              </p>
            )}

            <p className="enrollment-message">
              You are enrolled in this course.
            </p>
          </>
        )}

        {message && (
          <p className="enrollment-message">
            {message}
          </p>
        )}

        <Link to="/courses" className="login-btn">
          Back to Courses
        </Link>
      </div>
    </div>
  );
}

// Helper functions
async function fetchCourse(id) {
  const api = (await import("../services/api")).default;
  const response = await api.get(`courses/${id}/`);
  return response.data;
}

async function fetchLessons(id) {
  const api = (await import("../services/api")).default;
  const response = await api.get(
    `courses/lessons/?course=${id}`
  );
  return response.data;
}

export default CourseDetails;
