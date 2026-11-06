import { useEffect, useState } from "react";
import { getQuizzes } from "./services/api";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getQuizzes();

        setQuizzes(response.results || response);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Unable to load quizzes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="quizzes-container">
      <h2>Available Quizzes</h2>

      {quizzes.length === 0 ? (
        <p>No quizzes are available yet.</p>
      ) : (
        quizzes.map((quiz) => (
          <div className="quiz-card" key={quiz.id}>
            <h3>{quiz.title}</h3>
            <p>{quiz.description}</p>
            <p>Passing score: {quiz.passing_score}%</p>
            <button>Start Quiz</button>
          </div>
        ))
      )}
    </div>
  );
}

export default Quizzes;