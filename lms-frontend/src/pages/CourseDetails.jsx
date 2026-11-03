
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  enrollInCourse,
  initiatePayment,
  getPayments,
} from "../services/api";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [paymentSent, setPaymentSent] = useState(false);
  const [showDemoPin, setShowDemoPin] = useState(false);
  const [demoPin, setDemoPin] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseResponse = await fetchCourse(id);
        setCourse(courseResponse);

        const lessonsResponse = await fetchLessons(id);
        setLessons(lessonsResponse);
      } catch (err) {
        console.error("Course details error:", err);
        setError("Unable to load course details. Please log in and try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  const handleFreeEnrollment = async () => {
    setEnrolling(true);
    setMessage("");

    try {
      await enrollInCourse(Number(id));
      setMessage("Congratulations! You have successfully enrolled in this course.");
    } catch (err) {
      setMessage(
        err.response?.data?.detail ||
        "Unable to enroll. You may already be enrolled or need to log in."
      );
    } finally {
      setEnrolling(false);
    }
  };

  
const handlePayment = async () => {
  if (!phoneNumber.trim()) {
    setMessage("Please enter your phone number.");
    return;
  }

  setEnrolling(true);
  setMessage("");

  try {
    const payment = await initiatePayment(Number(id), phoneNumber);

    if (payment.status === "SUCCESS") {
      await enrollInCourse(Number(id));
      setMessage(
        "Demo payment successful! You are now enrolled in this course."
      );
    } else {
      setPaymentSent(true);
      setMessage(
        "Payment request sent! Complete your M-Pesa payment, then check its status."
      );
    }
  } catch (err) {
    setMessage(
      err.response?.data?.detail ||
      "Unable to process payment. Please try again."
    );
  } finally {
    setEnrolling(false);
  }
};

   
const handleDemoPinConfirmation = async () => {
  if (!/^\d{4}$/.test(demoPin)) {
    setMessage("Please enter any 4-digit demo PIN.");
    return;
  }

  setEnrolling(true);
  setMessage("");

  try {
    await enrollInCourse(Number(id));

    setShowDemoPin(false);
    setDemoPin("");
    setPaymentSent(false);

    setMessage(
      "Demo payment confirmed! You are now successfully enrolled."
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
        setMessage("Payment has not been confirmed yet. Please wait and try again.");
        return;
      }

      await enrollInCourse(Number(id));
      setMessage("Payment confirmed! You have successfully enrolled in this course.");
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

  return (
    <div className="course-details-page">
      <div className="course-details-card">
        <p className="course-details-label">COURSE DETAILS</p>

        <h1>{course.title}</h1>

        <p className="course-details-description">
          {course.description}
        </p>

        <div className="course-details-info">
          <p><strong>Instructor:</strong> {course.instructor_username}</p>
          <p>
            <strong>Price:</strong>{" "}
            {isFree
              ? "Free"
              : `KSh ${Number(course.price).toLocaleString("en-KE")}`}
          </p>
          <p><strong>Total Lessons:</strong> {lessons.length}</p>
        </div>

        <hr />

        <h2>Course Curriculum</h2>

        {lessons.length > 0 ? (
          <div className="course-lessons-list">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <div className="course-lesson-item" key={lesson.id}>
                  <div>
                    <span>Lesson {index + 1}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.content}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>No lessons have been added to this course yet.</p>
        )}

        <hr />

        <h2>Join This Course</h2>

        {isFree ? (
          <button
            className="enroll-btn"
            onClick={handleFreeEnrollment}
            disabled={enrolling}
          >
            {enrolling ? "Please wait..." : "Enroll Now"}
          </button>
        ) : (
          <div className="payment-section">
            <label htmlFor="phoneNumber">M-Pesa Phone Number</label>

            <input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. 0712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={paymentSent}
            />

            {!paymentSent ? (
              <button
                className="enroll-btn"
                onClick={handlePayment}
                disabled={enrolling}
              >
                {enrolling ? "Please wait..." : "Pay with M-Pesa"}
              </button>
            ) : (
              <button
                className="enroll-btn"
                onClick={handleCheckPayment}
                disabled={enrolling}
              >
                {enrolling ? "Checking..." : "Check Payment & Enroll"}
              </button>
            )}
          </div>
        )}

        
{showDemoPin && (
  <div className="demo-pin-overlay">
    <div className="demo-pin-card">
      <div className="demo-mpesa-logo">M-PESA</div>

      <h2>Payment Confirmation</h2>

      <p>Confirm your demo payment for:</p>

      <h3>{course.title}</h3>

      <p className="demo-payment-amount">
        KSh {Number(course.price).toLocaleString("en-KE")}
      </p>

      <label htmlFor="demoPin">Enter your 4-digit demo PIN</label>

      <input
        id="demoPin"
        type="password"
        inputMode="numeric"
        maxLength="4"
        placeholder="Enter any 4 digits"
        value={demoPin}
        onChange={(e) =>
          setDemoPin(e.target.value.replace(/\D/g, ""))
        }
      />

      <button
        className="enroll-btn"
        onClick={handleDemoPinConfirmation}
        disabled={enrolling}
      >
        {enrolling ? "Confirming..." : "Confirm Payment"}
      </button>

      <button
        className="demo-cancel-btn"
        onClick={() => {
          setShowDemoPin(false);
          setDemoPin("");
        }}
      >
        Cancel
      </button>

      <p className="demo-disclaimer">
        Demo payment only. No real money will be charged.
        This is not an official Safaricom M-Pesa prompt.
      </p>
    </div>
  </div>
)}

{message && <p className="enrollment-message">{message}</p>}


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
  const response = await api.get(`courses/lessons/?course=${id}`);
  return response.data;
}

export default CourseDetails;
