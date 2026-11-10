
import { useEffect, useState } from "react";
import "./Quizzes.css";

import {
  getQuizzes,
  getCourse,
  getQuizQuestions,
  getEnrollments,
  getLessons,
  getLessonProgress,
  startQuizAttempt,
  submitQuizAttempt,
} from "./services/api";

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [lessonStats, setLessonStats] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [courseInstructors, setCourseInstructors] = useState([]);
  const [selectedReviewerId, setSelectedReviewerId] = useState("");
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [
          quizResponse,
          enrollmentResponse,
          progressResponse,
        ] = await Promise.all([
          getQuizzes(),
          getEnrollments(),
          getLessonProgress(),
        ]);

        const allQuizzes =
          quizResponse.results || quizResponse;

        const enrollments =
          enrollmentResponse.results || enrollmentResponse;

        const allProgress =
          progressResponse.results || progressResponse;

        const enrolledCourseIds = enrollments.map(
          (enrollment) => Number(enrollment.course)
        );

        const enrolledQuizzes = allQuizzes.filter(
          (quiz) =>
            enrolledCourseIds.includes(Number(quiz.course))
        );

        setQuizzes(enrolledQuizzes);

        // Calculate lesson completion for each quiz.
        const stats = {};

        await Promise.all(
          enrolledQuizzes.map(async (quiz) => {
            const enrollment = enrollments.find(
              (item) =>
                Number(item.course) === Number(quiz.course)
            );

            if (!enrollment) return;

            const lessonResponse = await getLessons(quiz.course);
            const lessons =
              lessonResponse.results || lessonResponse;

            const completedLessonIds = new Set(
              allProgress
                .filter(
                  (progress) =>
                    Number(progress.enrollment) ===
                      Number(enrollment.id) &&
                    progress.is_completed
                )
                .map((progress) => Number(progress.lesson))
            );

            const completed = lessons.filter(
              (lesson) =>
                completedLessonIds.has(Number(lesson.id))
            ).length;

            stats[quiz.id] = {
              total: lessons.length,
              completed,
              remaining: lessons.length - completed,
              canSubmit:
                lessons.length > 0 &&
                completed === lessons.length,
            };
          })
        );

        setLessonStats(stats);

      } catch (err) {
        console.error(err);
        setError("Unable to load your quizzes and lesson progress.");
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
      setAttemptId(null);

      const response = await getQuizQuestions(quiz.id);
      const questionList = response.results || response;
      // Load instructors assigned to this course
const courseResponse = await getCourse(quiz.course);

setCourseInstructors(
  courseResponse.instructors_details || []
);

setSelectedReviewerId("");

      setSelectedQuiz(quiz);
      setQuestions(questionList);

      if (questionList.length === 0) {
        return;
      }

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
    const stats = lessonStats[selectedQuiz.id];

    if (!stats || !stats.canSubmit) {
      setError(
        "Please complete all lessons before submitting your quiz."
      );
      return;
    }

    if (questions.some((question) => !answers[question.id])) {
      setError("Please answer all questions before submitting.");
      return;
    }
    if (!selectedReviewerId) {
  setError("Please select an instructor to review your quiz.");
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
        formattedAnswers,
        selectedReviewerId
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
        <p className="quiz-intro-label">
          SKILLNEST LEARNING
        </p>

        <h2>Test Your Knowledge</h2>

        <p>
          Challenge yourself with quizzes from your enrolled
          courses. Complete your lessons and demonstrate
          what you have learned.
        </p>
      </div>

      {error && <p className="quiz-error">{error}</p>}

      {!selectedQuiz ? (
        quizzes.length === 0 ? (
          <p>
            No quizzes are available for your enrolled courses yet.
          </p>
        ) : (
          quizzes.map((quiz) => {
            const stats = lessonStats[quiz.id];

            return (
              <div className="quiz-card" key={quiz.id}>
                <h3>{quiz.title}</h3>

                <p>{quiz.description}</p>

                <p>
                  Passing score: {quiz.passing_score}%
                </p>

                {stats && (
                  <div className="quiz-progress">
                    <p>
                      Lessons completed: {stats.completed} of{" "}
                      {stats.total}
                    </p>

                    <div className="quiz-progress-track">
                      <div
                        className="quiz-progress-fill"
                        style={{
                          width:
                            stats.total > 0
                              ? `${(stats.completed / stats.total) * 100}%`
                              : "0%",
                        }}
                      />
                    </div>

                    {stats.canSubmit ? (
                      <p className="quiz-complete-message">
                        All lessons completed! You can submit
                        your quiz.
                      </p>
                    ) : (
                      <p className="quiz-warning">
                        {stats.remaining} lesson(s) remaining
                        before you can submit.
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleStartQuiz(quiz)}
                  disabled={!stats}
                >
                  Start Quiz
                </button>
              </div>
            );
          })
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
                <button
                  onClick={() => handleStartQuiz(selectedQuiz)}
                >
                  Retake Quiz
                </button>
              )}
            </>
          ) : (
            <>
              {lessonStats[selectedQuiz.id] && (
                <div className="quiz-progress">
                  <p>
                    Lessons completed:{" "}
                    {lessonStats[selectedQuiz.id].completed} of{" "}
                    {lessonStats[selectedQuiz.id].total}
                  </p>

                  <div className="quiz-progress-track">
                    <div
                      className="quiz-progress-fill"
                      style={{
                        width: `${
                          lessonStats[selectedQuiz.id].total > 0
                            ? (lessonStats[selectedQuiz.id].completed /
                                lessonStats[selectedQuiz.id].total) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  {!lessonStats[selectedQuiz.id].canSubmit && (
                    <p className="quiz-warning">
                      Complete all{" "}
                      {lessonStats[selectedQuiz.id].remaining} remaining
                      lesson(s) before submitting this quiz.
                    </p>
                  )}
                </div>
              )}

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
                        checked={
                          answers[question.id] === option
                        }
                        onChange={() =>
                          handleAnswerChange(
                            question.id,
                            option
                          )
                        }
                      />

                      {question[
                        `option_${option.toLowerCase()}`
                      ]}
                    </label>
                  ))}
                </div>
              ))}

              <button
                onClick={handleSubmitQuiz}
                disabled={
                  submitting ||
                  !lessonStats[selectedQuiz.id]?.canSubmit
                }
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Quiz"}
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
