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
  const [message, setMessage] = useState("");

  // Fetch quiz submissions
  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuizSubmissionsForReview();

      console.log("Review attempts:", data);

      const results = Array.isArray(data)
        ? data
        : data.results || [];

      setAttempts(results);
    } catch (err) {
      console.error("Error fetching submissions:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to load quiz submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  // Approve or reject a submission
  const handleReview = async (attemptId, reviewStatus) => {
    try {
      setMessage("");
      setError("");

      const updatedAttempt = await reviewQuizAttempt(
        attemptId,
        reviewStatus
      );

      setAttempts((previousAttempts) =>
        previousAttempts.map((attempt) =>
          attempt.id === attemptId ? updatedAttempt : attempt
        )
      );

      setMessage(
        `Quiz attempt #${attemptId} marked as ${reviewStatus}.`
      );
    } catch (err) {
      console.error("Error reviewing quiz:", err);

      setError(
        err.response?.data?.detail ||
          "Failed to review this quiz attempt."
      );
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="quiz-reviews-container">
        <p>Loading quiz submissions...</p>
      </div>
    );
  }

  return (
    <div className="quiz-reviews-container">
      {/* Header */}
      <div className="review-header">
        <div>
          <h1>Quiz Reviews</h1>
          <p>Review submitted student quiz attempts.</p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchAttempts}
        >
          Refresh
        </button>
      </div>

      {/* Messages */}
      {message && (
        <p className="success-message">{message}</p>
      )}

      {error && (
        <p className="error-message">{error}</p>
      )}

      {/* Quiz submissions */}
      {attempts.length === 0 ? (
        <div className="empty-reviews">
          <h3>No quiz submissions found</h3>
          <p>Submitted quiz attempts will appear here.</p>
        </div>
      ) : (
        <div className="review-list">
          {attempts.map((attempt) => (
            <div className="review-card" key={attempt.id}>
              {/* Student information */}
              <div className="review-card-header">
                <div>
                  <h2>{attempt.quiz_title || "Quiz"}</h2>

                  <p>
                    Student:{" "}
                    {attempt.student_username ||
                      `Student #${attempt.student}`}
                  </p>

                  <p>Attempt ID: {attempt.id}</p>
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
              <div className="review-score">
                <strong>Automatic score:</strong>{" "}
                {attempt.score ?? 0}%
              </div>

              {/* Student answers */}
              <div className="review-answers">
                <h3>Student Answers</h3>

                {attempt.answers && attempt.answers.length > 0 ? (
                  attempt.answers.map((answer) => (
                    <div
                      className="review-answer"
                      key={answer.id}
                    >
                      <h4>
                        {answer.question_text ||
                          `Question #${answer.question}`}
                      </h4>

                      {/* Answer options */}
                      <div className="answer-options">
                        {[
                          ["A", answer.option_a],
                          ["B", answer.option_b],
                          ["C", answer.option_c],
                          ["D", answer.option_d],
                        ].map(([letter, option]) => (
                          <div
                            className="answer-option"
                            key={letter}
                          >
                            <strong>{letter}:</strong>{" "}
                            {option || "Option not available"}
                          </div>
                        ))}
                      </div>

                      {/* Selected answer */}
                      <p>
                        <strong>Student selected:</strong>{" "}
                        {answer.selected_answer || "Not answered"}
                      </p>

                      {/* Automatic marking */}
                      <p>
                        <strong>Automatic marking:</strong>{" "}
                        {answer.is_correct ? "Correct" : "Incorrect"}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No answers found for this attempt.</p>
                )}
              </div>

              {/* Approve and reject buttons */}
              <div className="review-actions">
                <button
                  className="pass-button"
                  disabled={
                    attempt.review_status === "PASS" ||
                    attempt.review_status === "FAIL"
                  }
                  onClick={() =>
                    handleReview(attempt.id, "PASS")
                  }
                >
                  Approve
                </button>

                <button
                  className="fail-button"
                  disabled={
                    attempt.review_status === "PASS" ||
                    attempt.review_status === "FAIL"
                  }
                  onClick={() =>
                    handleReview(attempt.id, "FAIL")
                  }
                >
                  Reject
                </button>
              </div>

              {/* Review date */}
              {attempt.reviewed_at && (
                <p className="reviewed-date">
                  Reviewed on:{" "}
                  {new Date(attempt.reviewed_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizReviews;