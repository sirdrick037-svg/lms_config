
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  getCourses,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../services/api";

function InstructorLessons() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [searchParams] = useSearchParams();

  const requestedCourseId = searchParams.get("course");

  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(
    requestedCourseId || ""
  );
  const [lessons, setLessons] = useState([]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState(1);

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [deletingLessonId, setDeletingLessonId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        const courseList = Array.isArray(data)
          ? data
          : data.results || [];

        setCourses(courseList);

        if (courseList.length > 0) {
          const requestedCourse = courseList.find(
            (course) =>
              Number(course.id) === Number(requestedCourseId)
          );

          setSelectedCourseId(
            requestedCourse
              ? String(requestedCourse.id)
              : String(courseList[0].id)
          );
        }
      } catch (err) {
        console.error("Course loading error:", err);
        setError("Unable to load your assigned courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  useEffect(() => {
    const loadLessons = async () => {
      if (!selectedCourseId) {
        setLessons([]);
        return;
      }

      setLessonsLoading(true);
      setError("");

      try {
        const data = await getLessons(selectedCourseId);
        const lessonList = Array.isArray(data)
          ? data
          : data.results || [];

        setLessons(lessonList);
      } catch (err) {
        console.error("Lesson loading error:", err);
        setLessons([]);
        setError("Unable to load lessons for this course.");
      } finally {
        setLessonsLoading(false);
      }
    };

    loadLessons();
  }, [selectedCourseId]);

  const handleCreateLesson = async (e) => {
    e.preventDefault();

    if (!selectedCourseId) {
      setError("Please select a course first.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const newLesson = await createLesson({
        course: Number(selectedCourseId),
        title,
        content,
        order: Number(order),
      });

      setLessons((previous) =>
        [...previous, newLesson].sort(
          (a, b) => Number(a.order) - Number(b.order)
        )
      );

      setTitle("");
      setContent("");
      setOrder(lessons.length + 2);

      setSuccess("Lesson created successfully!");
    } catch (err) {
      console.error("Lesson creation error:", err);

      const data = err.response?.data;

      setError(
        data
          ? Object.entries(data)
              .map(([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages)
                    ? messages.join(", ")
                    : messages
                }`
              )
              .join(" | ")
          : "Unable to create lesson. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setContent(lesson.content);
    setOrder(lesson.order);
    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingLessonId(null);
    setTitle("");
    setContent("");
    setOrder(lessons.length + 1);
    setError("");
    setSuccess("");
  };

  const handleUpdateLesson = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedLesson = await updateLesson(editingLessonId, {
        course: Number(selectedCourseId),
        title,
        content,
        order: Number(order),
      });

      setLessons((previous) =>
        previous
          .map((lesson) =>
            lesson.id === editingLessonId
              ? updatedLesson
              : lesson
          )
          .sort((a, b) => Number(a.order) - Number(b.order))
      );

      setEditingLessonId(null);
      setTitle("");
      setContent("");
      setOrder(lessons.length + 1);

      setSuccess("Lesson updated successfully!");
    } catch (err) {
      console.error("Lesson update error:", err);
      setError("Unable to update lesson. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lesson?"
    );

    if (!confirmed) return;

    setDeletingLessonId(lessonId);
    setError("");
    setSuccess("");

    try {
      await deleteLesson(lessonId);

      setLessons((previous) =>
        previous.filter((lesson) => lesson.id !== lessonId)
      );

      if (editingLessonId === lessonId) {
        handleCancelEdit();
      }

      setSuccess("Lesson deleted successfully!");
    } catch (err) {
      console.error("Lesson deletion error:", err);
      setError("Unable to delete lesson. Please try again.");
    } finally {
      setDeletingLessonId(null);
    }
  };

  const selectedCourse = courses.find(
    (course) => Number(course.id) === Number(selectedCourseId)
  );

  if (loading) {
    return (
      <div className="instructor-lessons-page">
        <p>Loading your assigned courses...</p>
      </div>
    );
  }

  if (!user || (user.role !== "INSTRUCTOR" && !user.is_staff)) {
    return (
      <div className="instructor-lessons-page">
        <h2>Access Denied</h2>
        <p>Only instructors can manage course lessons.</p>
        <Link to="/courses">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="instructor-lessons-page">
      <section className="instructor-lessons-hero">
        <span>INSTRUCTOR WORKSPACE</span>
        <h1>Manage Course Lessons</h1>
        <p>
          Create and organize lessons for the courses assigned to you.
        </p>
      </section>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {courses.length === 0 ? (
        <section className="instructor-lessons-empty">
          <h2>No Assigned Courses Yet</h2>
          <p>
            You do not have any courses assigned to you yet.
            Please contact the administrator.
          </p>
          <Link to="/courses" className="learn-more-btn">
            Back to Courses
          </Link>
        </section>
      ) : (
        <>
          <section className="instructor-course-selector">
            <label htmlFor="instructor-course">
              Select Your Course
            </label>

            <select
              id="instructor-course"
              value={selectedCourseId}
              onChange={(e) => {
                setSelectedCourseId(e.target.value);
                setSuccess("");
                setError("");
                handleCancelEdit();
              }}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            {selectedCourse && (
              <p>{selectedCourse.description}</p>
            )}
          </section>

          <section className="instructor-lesson-form-section">
            <h2>
              {editingLessonId ? "Edit Lesson" : "Create a New Lesson"}
            </h2>
            <p>
              {editingLessonId
                ? "Update the details of this lesson."
                : "Add learning material to the selected course."}
            </p>

            <form
              onSubmit={
                editingLessonId
                  ? handleUpdateLesson
                  : handleCreateLesson
              }
            >
              <label htmlFor="lesson-title">
                Lesson Title
              </label>

              <input
                id="lesson-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lesson title"
                required
              />

              <label htmlFor="lesson-content">
                Lesson Content
              </label>

              <textarea
                id="lesson-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the lesson content here..."
                rows="8"
                required
              />

              <label htmlFor="lesson-order">
                Lesson Number
              </label>

              <input
                id="lesson-order"
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                required
              />

              <button type="submit" disabled={saving}>
                {saving
                  ? "Saving Lesson..."
                  : editingLessonId
                    ? "Update Lesson"
                    : "Create Lesson"}
              </button>

              {editingLessonId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel Editing
                </button>
              )}
            </form>
          </section>

          <section className="instructor-existing-lessons">
            <h2>Course Lessons</h2>

            {lessonsLoading ? (
              <p>Loading lessons...</p>
            ) : lessons.length === 0 ? (
              <p>No lessons have been created for this course yet.</p>
            ) : (
              <div className="instructor-lessons-list">
                {lessons.map((lesson) => (
                  <article
                    className="instructor-lesson-card"
                    key={lesson.id}
                  >
                    <span>LESSON {lesson.order}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.content}</p>

                    <div className="instructor-lesson-actions">
                      <button
                        type="button"
                        onClick={() => handleEditLesson(lesson)}
                        disabled={saving || deletingLessonId !== null}
                      >
                        Edit Lesson
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLesson(lesson.id)}
                        disabled={
                          deletingLessonId === lesson.id || saving
                        }
                      >
                        {deletingLessonId === lesson.id
                          ? "Deleting..."
                          : "Delete Lesson"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default InstructorLessons;
