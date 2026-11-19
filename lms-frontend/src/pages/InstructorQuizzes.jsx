
import { useEffect, useState } from "react";
import {
  getCourses,
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../services/api";

function InstructorQuizzes() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
const [quizDescription, setQuizDescription] = useState("");
const [passingScore, setPassingScore] = useState(50);
const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [coursesData, quizzesData] = await Promise.all([
        getCourses(),
        getQuizzes(),
      ]);

      setCourses(coursesData);
      setQuizzes(quizzesData);
    } catch (err) {
      setError("Unable to load your courses and quizzes.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();

    if (!selectedCourse || !quizTitle.trim()) {
      setError("Please select a course and enter a quiz title.");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await createQuiz({
        course: Number(selectedCourse),
        title: quizTitle,
        description: quizDescription,
        passing_score: Number(passingScore),
        is_published: isPublished,
      });

      setQuizTitle("");
      setQuizDescription("");
      setPassingScore(50);
      setIsPublished(false);

      setSuccess("Quiz created successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to create the quiz."
      );
    }
  };


  if (loading) {
    return <div className="instructor-quizzes-page">Loading quizzes...</div>;
  }

  return (
    <div className="instructor-quizzes-page">
      <div className="instructor-quizzes-hero">
        <h1>My Quizzes</h1>
        <p>Create and manage quizzes for your assigned courses.</p>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <div className="instructor-quiz-course-selector">
        <label htmlFor="quiz-course">Select a course</label>

        <select
          id="quiz-course"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">Choose a course</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="instructor-quizzes-list">
        <h2>Existing Quizzes</h2>

        {quizzes.length === 0 ? (
          <p>No quizzes have been created yet.</p>
        ) : (
          quizzes.map((quiz) => (
            <div className="instructor-quiz-card" key={quiz.id}>
              <h3>{quiz.title}</h3>
              <p>{quiz.description}</p>
              <p>Passing score: {quiz.passing_score}%</p>
              <p>
                Status: {quiz.is_published ? "Published" : "Draft"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default InstructorQuizzes;
