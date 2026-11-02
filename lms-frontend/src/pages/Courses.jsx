
import { useEffect, useState } from "react";
import { getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getCourses()
      .then((data) => setCourses(data.results || data))
      .catch(() => setError("Unable to load courses. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="courses-page">

      <section className="courses-page-hero">
        <span>LEARN SOMETHING NEW</span>
        <h1>Explore Our Courses</h1>
        <p>
          Discover new skills, expand your knowledge and take
          the next step towards your future.
        </p>

        <input
          type="text"
          className="course-search"
          placeholder="Search for a course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="all-courses-section">
        <div className="courses-page-heading">
          <div>
            <span>FIND YOUR INTEREST</span>
            <h2>Available Courses</h2>
          </div>

          <p>{filteredCourses.length} courses found</p>
        </div>

        {loading && <p>Loading courses...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && filteredCourses.length === 0 && (
          <p className="no-courses">
            No courses found. Try another search.
          </p>
        )}

        {!loading && !error && (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className="course-icon">✦</div>

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

                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                  >
                    Learn More →
                  </button>
                </div>

                <span className="course-availability">
                  {course.is_published ? "Available" : "Coming soon"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedCourse && (
        <div
          className="course-modal-overlay"
          onClick={() => setSelectedCourse(null)}
        >
          <div
            className="course-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="close-modal"
              onClick={() => setSelectedCourse(null)}
              aria-label="Close"
            >
              ×
            </button>

            <span className="modal-category">
              {selectedCourse.category || "Online Course"}
            </span>

            <h2>{selectedCourse.title}</h2>

            <p className="modal-description">
              {selectedCourse.description ||
                "Course description coming soon."}
            </p>

            <div className="modal-info">
              <span>
                Price: {Number(selectedCourse.price) === 0
                  ? "Free"
                  : `KES ${selectedCourse.price}`}
              </span>

              <span>
                {selectedCourse.is_published
                  ? "Available"
                  : "Coming soon"}
              </span>
            </div>

            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setSelectedCourse(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Courses;
