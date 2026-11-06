import { useEffect, useState } from "react";
import {
  getQuizzes,
  getQuizQuestions,
  startQuizAttempt,
} from "./services/api";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();
        setQuizzes(response.results || response);
      } catch (err) {
        console.error(err);
        setError("Unable to load quizzes.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quiz) => {
    try {
      setError("");

      const attempt = await startQuizAttempt(quiz.id);
      const response = await getQuizQuestions(quiz.id);

      setAttemptId(attempt.id);
      setSelectedQuiz(quiz);
      setQuestions(response.results || response);
      setAnswers({});
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Unable to start quiz. Please try again."
      );
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: answer,
    }));
  };

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <div className="quizzes-container">
      <h2>Available Quizzes</h2>

      {error && <p>{error}</p>}

      {!selectedQuiz ? (
        quizzes.length === 0 ? (
          <p>No quizzes are available yet.</p>
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

          {questions.map((question, index) => (
            <div key={question.id}>
              <h3>
                {index + 1}. {question.text}
              </h3>

              {["A", "B", "C", "D"].map((option) => (
                <label key={option} style={{ display: "block" }}>
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

          <button onClick={() => alert("Answer submission is our next step!")}>
            Submit Quiz
          </button>

          <button
            onClick={() => {
              setSelectedQuiz(null);
              setQuestions([]);
              setAnswers({});
              setAttemptId(null);
              setError("");
            }}
          >
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}

export default Quizzes;