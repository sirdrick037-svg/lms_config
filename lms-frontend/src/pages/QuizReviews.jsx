
import { useEffect, useState } from "react";
import {
  getQuizSubmissionsForReview,
  reviewQuizAttempt,
} from "../services/api";
import "./QuizReviews.css";

function QuizReviews() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuizSubmissionsForReview();
      setAttempts(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load quiz submissions. Please check your permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleReview = async (attemptId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this attempt as ${status}?`
    );

    if (!confirmed) return;

    try {
      setReviewingId(attemptId);

      const updatedAttempt = await reviewQuizAttempt(attemptId, status);

      setAttempts((current) =>
        current.map((attempt) =>
          attempt.id === attemptId ? updatedAttempt : attempt
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Could not submit the review. Please try again."
      );
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return <div className="quiz-reviews-page">Loading submissions...</div>;
  }

  return (
    <div className="quiz-reviews-page">
      <div className="quiz-reviews-header">
        <h1>Quiz Submissions</h1>
        <p>Review student quiz attempts and approve their results.</p>
      </div>

      {error && <p className="review-error">{error}</p>}

      {!error && attempts.length === 0 && (
        <p className="review-empty">No quiz submissions found.</p>
      )}

      <div className="review-list">
        {attempts.map((attempt) => (
          <div className="review-card" key={attempt.id}>
            <div className="review-card-header">
              <div>
                <h2>{attempt.quiz_title || `Quiz #${attempt.quiz}`}</h2>
                <p>Student: {attempt.student_username || "Unknown"}</p>
              </div>

              <span className={`review-status ${attempt.review_status?.toLowerCase()}`}>
                {attempt.review_status || "PENDING"}
              </span>
            </div>

            <p>
              <strong>Score:</strong> {attempt.score ?? "Not available"}
            </p>

            <p>
              <strong>Submitted:</strong>{" "}
              {attempt.submitted_at
                ? new Date(attempt.submitted_at).toLocaleString()
                : "Not available"}
            </p>

            {attempt.answers?.length > 0 && (
              <div className="review-answers">
                <h3>Student Answers</h3>

                {attempt.answers.map((answer) => (
                  <div className="review-answer" key={answer.id}>
                    <p>
                      <strong>Question ID:</strong> {answer.question}
                    </p>
                    <p>
                      <strong>Selected answer:</strong>{" "}
                      {answer.selected_answer}
                    </p>
                    <p>
                      <strong>Automatically marked:</strong>{" "}
                      {answer.is_correct ? "Correct" : "Incorrect"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {attempt.review_status === "PENDING" && (
              <div className="review-actions">
                <button
                  onClick={() => handleReview(attempt.id, "PASS")}
                  disabled={reviewingId === attempt.id}
                  className="pass-button"
                >
                  {reviewingId === attempt.id ? "Saving..." : "Approve (PASS)"}
                </button>

                <button
                  onClick={() => handleReview(attempt.id, "FAIL")}
                  disabled={reviewingId === attempt.id}
                  className="fail-button"
                >
                  {reviewingId === attempt.id ? "Saving..." : "Reject (FAIL)"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizReviews;
