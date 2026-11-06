
import { useEffect, useState } from "react";
import {
  getQuizzes,
  getQuizQuestions,
  getEnrollments,
  startQuizAttempt,
  submitQuizAttempt,
} from "./services/api";
import "./Quizzes.css";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [quizResponse, enrollmentResponse] =
          await Promise.all([
            getQuizzes(),
            getEnrollments(),
          ]);

        const allQuizzes =
          quizResponse.results || quizResponse;

        const enrollments =
          enrollmentResponse.results || enrollmentResponse;

        const enrolledCourseIds = enrollments.map(
          (enrollment) => Number(enrollment.course)
        );

        const enrolledQuizzes = allQuizzes.filter(
          (quiz) =>
            enrolledCourseIds.includes(Number(quiz.course))
        );

        setQuizzes(enrolledQuizzes);
      } catch (err) {
        console.error(err);
        setError("Unable to load your quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quiz) => {
    try {
      setError("");
      setResult(null);
      setQuestions([]);
      setAnswers({});

      // Check for questions before creating an attempt.
      const response = await getQuizQuestions(quiz.id);
      const questionList = response.results || response;

      setSelectedQuiz(quiz);
      setQuestions(questionList);

      if (questionList.length === 0) {
        return;
      }

      // Create an attempt only when questions exist.
      const attempt = await startQuizAttempt(quiz.id);
      setAttemptId(attempt.id);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to open this quiz. Please try again."
      );
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (questions.some((question) => !answers[question.id])) {
      setError("Please answer all questions before submitting.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formattedAnswers = Object.entries(answers).map(
        ([questionId, selectedAnswer]) => ({
          question: Number(questionId),
          selected_answer: selectedAnswer,
        })
      );

      const response = await submitQuizAttempt(
        attemptId,
        formattedAnswers
      );

      setResult(response);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to submit quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    setSelectedQuiz(null);
    setQuestions([]);
    setAnswers({});
    setAttemptId(null);
    setResult(null);
    setError("");
  };

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <div className="quizzes-container">
      <div className="quiz-intro">
  <p className="quiz-intro-label">SKILLNEST LEARNING</p>
  <h2>Test Your Knowledge</h2>
  <p>
    Challenge yourself with quizzes from your enrolled courses.
    Track your understanding and see how much you've learned.
  </p>
</div>

      {error && <p>{error}</p>}

      {!selectedQuiz ? (
        quizzes.length === 0 ? (
          <p>
            No quizzes are available for your enrolled courses yet.
          </p>
        ) : (
          quizzes.map((quiz) => (
            <div className="quiz-card" key={quiz.id}>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <p>Passing score: {quiz.passing_score}%</p>

              <button onClick={() => handleStartQuiz(quiz)}>
                Start Quiz
              </button>
            </div>
          ))
        )
      ) : (
        <div className="quiz-card">
          <h2>{selectedQuiz.title}</h2>

          {questions.length === 0 ? (
            <p>No questions have been posted for this quiz yet.</p>
          ) : result ? (
            <>
              <h3>Your Score: {result.score}%</h3>

              <h3>
                {result.passed
                  ? "Congratulations! You passed!"
                  : "You did not pass. Try again!"}
              </h3>

              {!result.passed && (
                <button onClick={() => handleStartQuiz(selectedQuiz)}>
                  Retake Quiz
                </button>
              )}
            </>
          ) : (
            <>
              {questions.map((question, index) => (
                <div key={question.id}>
                  <h3>
                    {index + 1}. {question.text}
                  </h3>

                  {["A", "B", "C", "D"].map((option) => (
                    <label
                      key={option}
                      style={{ display: "block" }}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={() =>
                          handleAnswerChange(question.id, option)
                        }
                      />

                      {question[`option_${option.toLowerCase()}`]}
                    </label>
                  ))}
                </div>
              ))}

              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </>
          )}

          <button onClick={handleBack}>
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}

export default Quizzes;
