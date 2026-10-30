
import { useEffect, useState } from "react";
import { getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data.results || data))
      .catch(() => setError("Unable to load courses. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Discover new skills and take your learning further.</p>
      </div>

      {loading && <p>Loading courses...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <p>No courses are available yet.</p>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <article className="course-card" key={course.id}>
            <span className="course-category">
              {course.category || "Online Course"}
            </span>

            <h3>{course.title}</h3>

            <p>{course.description}</p>

            <div className="course-card-bottom">
              <strong>
                {Number(course.price) === 0
                  ? "Free"
                  : `KES ${course.price}`}
              </strong>

              <span>
                {course.is_published ? "Available" : "Coming soon"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Courses;
