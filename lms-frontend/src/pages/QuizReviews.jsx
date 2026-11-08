
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

  // Fetch quiz submissions
  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuizSubmissionsForReview();

      setAttempts(
        Array.isArray(data) ? data : data.results || []
      );
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

  // Review a quiz attempt
  const handleReview = async (attemptId, status) => {
    const confirmed = window.confirm(
      `Are you sure you want to mark this attempt as ${status}?`
    );

    if (!confirmed) return;

    try {
      setReviewingId(attemptId);

      const updatedAttempt = await reviewQuizAttempt(
        attemptId,
        status
      );

      setAttempts((current) =>
        current.map((attempt) =>
          attempt.id === attemptId
            ? updatedAttempt
            : attempt
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
    return (
      <div className="quiz-reviews-page">
        <p>Loading quiz submissions...</p>
      </div>
    );
  }

  return (
    <div className="quiz-reviews-page">

      {/* Page Header */}
      <div className="quiz-reviews-header">
        <h1>Quiz Reviews</h1>
        <p>
          Review student quiz attempts and approve their results.
        </p>

        <button
          className="refresh-button"
          onClick={fetchAttempts}
        >
          Refresh Submissions
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="review-error">{error}</p>
      )}

      {/* Empty State */}
      {!error && attempts.length === 0 && (
        <p className="review-empty">
          No quiz submissions found.
        </p>
      )}

      {/* Quiz Submission List */}
      <div className="review-list">

        {attempts.map((attempt) => (

          <div className="review-card" key={attempt.id}>

            {/* Student and Quiz Information */}
            <div className="review-card-header">
              <div>
                <h2>
                  {attempt.quiz_title ||
                    `Quiz #${attempt.quiz}`}
                </h2>

                <p>
                  <strong>Student:</strong>{" "}
                  {attempt.student_username || "Unknown"}
                </p>
              </div>

              <span
                className={`review-status ${
                  (attempt.review_status || "PENDING").toLowerCase()
                }`}
              >
                {attempt.review_status || "PENDING"}
              </span>
            </div>

            {/* Score */}
            <div className="review-information">
              <p>
                <strong>Score:</strong>{" "}
                {attempt.score ?? "Not available"}
              </p>

              <p>
                <strong>Submitted:</strong>{" "}
                {attempt.submitted_at
                  ? new Date(
                      attempt.submitted_at
                    ).toLocaleString()
                  : "Not available"}
              </p>
            </div>

            {/* Student Answers */}
            {attempt.answers?.length > 0 && (
              <div className="review-answers">

                <h3>Student Answers</h3>

                {attempt.answers.map((answer) => (

                  <div
                    className="review-answer"
                    key={answer.id}
                  >

                    <h4>
                      {answer.question_text ||
                        `Question #${answer.question}`}
                    </h4>

                    <div className="answer-options">

                      <p>
                        <strong>A:</strong>{" "}
                        {answer.option_a}
                      </p>

                      <p>
                        <strong>B:</strong>{" "}
                        {answer.option_b}
                      </p>

                      <p>
                        <strong>C:</strong>{" "}
                        {answer.option_c}
                      </p>

                      <p>
                        <strong>D:</strong>{" "}
                        {answer.option_d}
                      </p>

                    </div>

                    <p>
                      <strong>Student selected:</strong>{" "}
                      {answer.selected_answer}
                    </p>

                    <p>
                      <strong>Automatic marking:</strong>{" "}
                      <span
                        className={
                          answer.is_correct
                            ? "answer-correct"
                            : "answer-incorrect"
                        }
                      >
                        {answer.is_correct
                          ? "Correct"
                          : "Incorrect"}
                      </span>
                    </p>

                  </div>
                ))}

              </div>
            )}

            {/* Review Actions */}
            {attempt.review_status === "PENDING" && (

              <div className="review-actions">

                <button
                  className="pass-button"
                  onClick={() =>
                    handleReview(attempt.id, "PASS")
                  }
                  disabled={reviewingId === attempt.id}
                >
                  {reviewingId === attempt.id
                    ? "Saving..."
                    : "Approve (PASS)"}
                </button>

                <button
                  className="fail-button"
                  onClick={() =>
                    handleReview(attempt.id, "FAIL")
                  }
                  disabled={reviewingId === attempt.id}
                >
                  {reviewingId === attempt.id
                    ? "Saving..."
                    : "Reject (FAIL)"}
                </button>

              </div>
            )}

            {/* Reviewed Information */}
            {attempt.review_status !== "PENDING" && (
              <p className="review-completed">
                This submission has been reviewed.
              </p>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default QuizReviews;
