
import { useEffect, useState } from "react";
import {
  getQuizSubmissionsForReview,
  reviewQuizAttempt,
} from "../services/api";
import "./QuizReviews.css";

function QuizReviews() {
  const [attempts, setAttempts] = useState([]);
  const [marks, setMarks] = useState({});
  const [reviewingId, setReviewingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [view, setView] = useState("pending");
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getQuizSubmissionsForReview();
      const results = Array.isArray(data)
        ? data
        : data.results || [];

      setAttempts(results);

      const initialMarks = {};
      results.forEach((attempt) => {
        initialMarks[attempt.id] =
          attempt.reviewed_score ?? "";
      });

      setMarks(initialMarks);
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

  const handleMarkChange = (attemptId, value) => {
    setMarks((previousMarks) => ({
      ...previousMarks,
      [attemptId]: value,
    }));
  };

  const handleReview = async (attemptId) => {
    const enteredMark = marks[attemptId];

    if (
      enteredMark === "" ||
      enteredMark === undefined ||
      !Number.isInteger(Number(enteredMark)) ||
      Number(enteredMark) < 0 ||
      Number(enteredMark) > 100
    ) {
      setError("Please enter a whole-number mark between 0 and 100.");
      return;
    }

    try {
      setMessage("");
      setError("");
      setReviewingId(attemptId);

      const updatedAttempt = await reviewQuizAttempt(
        attemptId,
        Number(enteredMark)
      );

      setAttempts((previousAttempts) =>
        previousAttempts.map((attempt) =>
          attempt.id === attemptId ? updatedAttempt : attempt
        )
      );

      setMessage("Quiz submission reviewed successfully.");
    } catch (err) {
      console.error("Error reviewing quiz:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to review this quiz attempt."
      );
    } finally {
      setReviewingId(null);
    }
  };

  const isReviewed = (attempt) =>
    attempt.review_status === "PASS" ||
    attempt.review_status === "FAIL";

  const filteredAttempts = attempts.filter((attempt) =>
    view === "pending"
      ? !isReviewed(attempt)
      : isReviewed(attempt)
  );

  const toggleAttempt = (attemptId) => {
    setExpandedAttemptId((previousId) =>
      previousId === attemptId ? null : attemptId
    );
  };

  if (loading) {
    return (
      <div className="quiz-reviews-container">
        <p>Loading quiz submissions...</p>
      </div>
    );
  }

  return (
    <div className="quiz-reviews-container">
      <div className="review-header">
        <div>
          <h1>Quiz Reviews</h1>
          <p>Manage student quiz submissions and results.</p>
        </div>

        <button className="refresh-button" onClick={fetchAttempts}>
          Refresh
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <div className="review-tabs">
        <button
          className={view === "pending" ? "active" : ""}
          onClick={() => {
            setView("pending");
            setError("");
            setMessage("");
            setExpandedAttemptId(null);
          }}
        >
          Pending Reviews ({attempts.filter((a) => !isReviewed(a)).length})
        </button>

        <button
          className={view === "reviewed" ? "active" : ""}
          onClick={() => {
            setView("reviewed");
            setError("");
            setMessage("");
            setExpandedAttemptId(null);
          }}
        >
          Reviewed Submissions ({attempts.filter(isReviewed).length})
        </button>
      </div>

      {filteredAttempts.length === 0 ? (
        <div className="empty-reviews">
          <h3>
            {view === "pending"
              ? "No pending quiz submissions"
              : "No reviewed submissions"}
          </h3>
          <p>
            {view === "pending"
              ? "New student submissions awaiting grading will appear here."
              : "Completed quiz reviews will appear here."}
          </p>
        </div>
      ) : (
        <div className="review-list">
          {filteredAttempts.map((attempt) => {
            const reviewed = isReviewed(attempt);
            const expanded = expandedAttemptId === attempt.id;

            return (
              <div className="review-card compact-review-card" key={attempt.id}>
                <button
                  type="button"
                  className="compact-review-heading"
                  onClick={() => toggleAttempt(attempt.id)}
                  aria-expanded={expanded}
                >
                  <div className="compact-review-title">
                    <h2>{attempt.quiz_title || "Quiz"}</h2>
                    <p>
                      Student:{" "}
                      {attempt.student_username ||
                        `Student #${attempt.student}`}
                    </p>
                    <span>
                      {attempt.answers?.length || 0} answers
                    </span>
                  </div>

                  <div className="compact-review-heading-right">
                    <span
                      className={`review-status ${
                        (attempt.review_status || "PENDING").toLowerCase()
                      }`}
                    >
                      {attempt.review_status || "PENDING"}
                    </span>
                    <span className="review-expand-icon">
                      {expanded ? "−" : "+"}
                    </span>
                  </div>
                </button>

                {expanded && (
                  <div className="compact-review-details">
                    <div className="review-score">
                      <strong>Automatic score:</strong>{" "}
                      {attempt.score ?? 0}%
                    </div>

                    <div className="review-answers">
                      <h3>Student Answers</h3>

                      {attempt.answers?.length > 0 ? (
                        attempt.answers.map((answer) => (
                          <div className="review-answer" key={answer.id}>
                            <h4>
                              {answer.question_text ||
                                `Question #${answer.question}`}
                            </h4>

                            <div className="answer-options">
                              {[
                                ["A", answer.option_a],
                                ["B", answer.option_b],
                                ["C", answer.option_c],
                                ["D", answer.option_d],
                              ].map(([letter, option]) => (
                                <div className="answer-option" key={letter}>
                                  <strong>{letter}:</strong>{" "}
                                  {option || "Option not available"}
                                </div>
                              ))}
                            </div>

                            <p>
                              <strong>Student selected:</strong>{" "}
                              {answer.selected_answer || "Not answered"}
                            </p>

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

                    <div className="review-actions">
                      {!reviewed ? (
                        <>
                          <label>Awarded Mark (%)</label>

                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            placeholder="Enter mark from 0 to 100"
                            value={marks[attempt.id] ?? ""}
                            onChange={(event) =>
                              handleMarkChange(attempt.id, event.target.value)
                            }
                          />

                          <button
                            className="pass-button"
                            disabled={reviewingId === attempt.id}
                            onClick={() => handleReview(attempt.id)}
                          >
                            {reviewingId === attempt.id
                              ? "Submitting..."
                              : "Award Mark"}
                          </button>
                        </>
                      ) : (
                        <div className="final-review-result">
                          <h3>Final Result: {attempt.review_status}</h3>
                          <p>
                            <strong>Awarded Mark:</strong>{" "}
                            {attempt.reviewed_score ?? "Not available"}%
                          </p>
                          <p>
                            <strong>Feedback:</strong>{" "}
                            {attempt.instructor_feedback ||
                              "No feedback available."}
                          </p>
                        </div>
                      )}
                    </div>

                    {attempt.reviewed_at && (
                      <p className="reviewed-date">
                        Reviewed on:{" "}
                        {new Date(attempt.reviewed_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default QuizReviews;
