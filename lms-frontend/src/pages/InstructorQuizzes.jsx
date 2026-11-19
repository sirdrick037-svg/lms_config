
import { useEffect, useState } from "react";
import {
  getCourses,
  getQuizzes,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuestion,
  deleteQuestion,
} from "../services/api";

function InstructorQuizzes() {
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [expandedQuizId, setExpandedQuizId] = useState(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(50);
  const [isPublished, setIsPublished] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState(null);

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

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

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      !selectedCourse || String(quiz.course) === selectedCourse
  );

  const resetQuizForm = () => {
    setEditingQuizId(null);
    setQuizTitle("");
    setQuizDescription("");
    setPassingScore(50);
    setIsPublished(false);
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

      resetQuizForm();
      setShowQuizForm(false);
      setSuccess("Quiz created successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to create the quiz."
      );
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuizId(quiz.id);
    setSelectedCourse(String(quiz.course));
    setQuizTitle(quiz.title);
    setQuizDescription(quiz.description || "");
    setPassingScore(quiz.passing_score);
    setIsPublished(quiz.is_published);
    setShowQuizForm(true);
    setSelectedQuiz(null);
    setError("");
    setSuccess("");
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setSuccess("");

      await updateQuiz(editingQuizId, {
        course: Number(selectedCourse),
        title: quizTitle,
        description: quizDescription,
        passing_score: Number(passingScore),
        is_published: isPublished,
      });

      resetQuizForm();
      setShowQuizForm(false);
      setSuccess("Quiz updated successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to update the quiz."
      );
    }
  };

  const handleCancelEdit = () => {
    resetQuizForm();
    setShowQuizForm(false);
    setError("");
    setSuccess("");
  };

  const handleDeleteQuiz = async (quizId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz? Quizzes with student attempts are protected."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteQuiz(quizId);

      if (selectedQuiz?.id === quizId) {
        setSelectedQuiz(null);
        setQuestions([]);
      }

      setSuccess("Quiz deleted successfully!");
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        "Unable to delete the quiz."
      );
    }
  };

  const handleOpenQuiz = async (quiz) => {
    try {
      setError("");
      setSuccess("");

      const questionsData = await getQuizQuestions(quiz.id);

      setSelectedQuiz(quiz);
      setQuestions(questionsData);
      setExpandedQuestionId(null);
      setExpandedQuizId(quiz.id);

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
    } catch (err) {
      setError("Unable to load questions for this quiz.");
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();

    if (!selectedQuiz) return;

    try {
      setError("");
      setSuccess("");

      await createQuestion(selectedQuiz.id, {
        text: questionText,
        option_a: optionA,
        option_b: optionB,
        option_c: optionC,
        option_d: optionD,
        correct_answer: correctAnswer,
      });

      setQuestionText("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");

      const questionsData = await getQuizQuestions(selectedQuiz.id);
      setQuestions(questionsData);

      setSuccess("Question added successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to add the question."
      );
    }
  };

  const handleArchiveQuestion = async (question) => {
    const confirmed = window.confirm(
      "Archive this question? It will no longer be available to students starting new attempts."
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteQuestion(question.id);

      const questionsData = await getQuizQuestions(selectedQuiz.id);
      setQuestions(questionsData);

      setSuccess("Question archived successfully!");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to archive the question."
      );
    }
  };

  if (loading) {
    return (
      <div className="instructor-quizzes-page">
        Loading quizzes...
      </div>
    );
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
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedQuiz(null);
            setQuestions([]);
            setExpandedQuizId(null);
            setShowQuizForm(false);
            resetQuizForm();
          }}
        >
          <option value="">All assigned courses</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>

      <div className="instructor-quiz-form-section">
        <button
          type="button"
          onClick={() => {
            if (showQuizForm) {
              handleCancelEdit();
            } else {
              resetQuizForm();
              setShowQuizForm(true);
            }
          }}
        >
          {showQuizForm ? "Close Quiz Form" : "+ Create New Quiz"}
        </button>

        {showQuizForm && (
          <>
            <h2>
              {editingQuizId ? "Update Quiz" : "Create a New Quiz"}
            </h2>

            <form
              onSubmit={
                editingQuizId ? handleUpdateQuiz : handleCreateQuiz
              }
            >
              <label>Quiz Title</label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                placeholder="Enter quiz title"
                required
              />

              <label>Quiz Description</label>
              <textarea
                value={quizDescription}
                onChange={(e) => setQuizDescription(e.target.value)}
                placeholder="Describe what the quiz covers"
              />

              <label>Passing Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                required
              />

              <label className="quiz-publish-option">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                Publish quiz
              </label>

              <button type="submit" disabled={!selectedCourse}>
                {editingQuizId ? "Update Quiz" : "Create Quiz"}
              </button>

              {editingQuizId && (
                <button type="button" onClick={handleCancelEdit}>
                  Cancel
                </button>
              )}
            </form>
          </>
        )}
      </div>

      <div className="instructor-quizzes-list">
        <h2>Existing Quizzes ({filteredQuizzes.length})</h2>

        {filteredQuizzes.length === 0 ? (
          <p>No quizzes found for this course.</p>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div className="instructor-quiz-card" key={quiz.id}>
              <div
                className="compact-quiz-heading"
                onClick={() =>
                  setExpandedQuizId(
                    expandedQuizId === quiz.id ? null : quiz.id
                  )
                }
              >
                <div>
                  <h3>{quiz.title}</h3>
                  <p>
                    {quiz.is_published ? "Published" : "Draft"} · Passing score:{" "}
                    {quiz.passing_score}%
                  </p>
                </div>

                <span>
                  {expandedQuizId === quiz.id ? "−" : "+"}
                </span>
              </div>

              {expandedQuizId === quiz.id && (
                <div className="compact-quiz-details">
                  <p>{quiz.description}</p>

                  <div className="instructor-quiz-actions">
                    <button onClick={() => handleEditQuiz(quiz)}>
                      Edit Quiz
                    </button>

                    <button onClick={() => handleOpenQuiz(quiz)}>
                      Manage Questions
                    </button>

                    <button onClick={() => handleDeleteQuiz(quiz.id)}>
                      Delete Quiz
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedQuiz && (
        <div className="instructor-questions-section">
          <h2>Manage Questions</h2>
          <p>{selectedQuiz.title}</p>

          <button
            type="button"
            onClick={() => setSelectedQuiz(null)}
          >
            Close Question Management
          </button>

          <details className="compact-question-form">
            <summary>Add a New Question</summary>

            <form onSubmit={handleCreateQuestion}>
              <label>Question</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter your question"
                required
              />

              <label>Option A</label>
              <input
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                required
              />

              <label>Option B</label>
              <input
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                required
              />

              <label>Option C</label>
              <input
                value={optionC}
                onChange={(e) => setOptionC(e.target.value)}
                required
              />

              <label>Option D</label>
              <input
                value={optionD}
                onChange={(e) => setOptionD(e.target.value)}
                required
              />

              <label>Correct Answer</label>
              <select
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>

              <button type="submit">Add Question</button>
            </form>
          </details>

          <h3>Existing Questions ({questions.length})</h3>

          {questions.length === 0 ? (
            <p>No questions have been added yet.</p>
          ) : (
            questions.map((question, index) => (
              <div className="instructor-question-card" key={question.id}>
                <div
                  className="compact-question-heading"
                  onClick={() =>
                    setExpandedQuestionId(
                      expandedQuestionId === question.id
                        ? null
                        : question.id
                    )
                  }
                >
                  <strong>Question {index + 1}: {question.text}</strong>
                  <span>
                    {expandedQuestionId === question.id ? "−" : "+"}
                  </span>
                </div>

                {expandedQuestionId === question.id && (
                  <div className="compact-question-details">
                    <p>A. {question.option_a}</p>
                    <p>B. {question.option_b}</p>
                    <p>C. {question.option_c}</p>
                    <p>D. {question.option_d}</p>

                    <p>
                      Status: {question.is_active ? "Active" : "Archived"}
                    </p>

                    {question.is_active && (
                      <button
                        type="button"
                        onClick={() => handleArchiveQuestion(question)}
                      >
                        Archive Question
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default InstructorQuizzes;
