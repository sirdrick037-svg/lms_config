
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const courseResponse = await api.get(`courses/${id}/`);
        setCourse(courseResponse.data);

        const lessonsResponse = await api.get(
          `courses/lessons/?course=${id}`
        );

        setLessons(lessonsResponse.data);
      } catch (err) {
        console.error("Course details error:", err);
        setError(
          "Unable to load course details. Please log in and try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [id]);

  if (loading) {
    return <p>Loading course details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!course) {
    return <p>Course not found.</p>;
  }

  return (
    <div className="course-details-page">
      <div className="course-details-card">

        <p className="course-details-label">
          COURSE DETAILS
        </p>

        <h1>{course.title}</h1>

        <p className="course-details-description">
          {course.description}
        </p>

        <div className="course-details-info">
          <p>
            <strong>Instructor:</strong>{" "}
            {course.instructor_username}
          </p>

          <p>
            <strong>Price:</strong>{" "}
            KSh {Number(course.price).toLocaleString("en-KE")}
          </p>

          <p>
            <strong>Total Lessons:</strong> {lessons.length}
          </p>
        </div>

        <hr />

        <h2>Course Curriculum</h2>

        {lessons.length > 0 ? (
          <div className="course-lessons-list">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, index) => (
                <div className="course-lesson-item" key={lesson.id}>
                  <div>
                    <span>Lesson {index + 1}</span>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.content}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p>No lessons have been added to this course yet.</p>
        )}

        <Link to="/courses" className="login-btn">
          Back to Courses
        </Link>

      </div>
    </div>
  );
}

export default CourseDetails;
