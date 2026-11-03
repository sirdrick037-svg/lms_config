
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/api";

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

                 <Link
                   to={`/courses/${course.id}`}
                   className="learn-more-btn">
                       Enroll Now
                 </Link>
                </div>

                <span className="course-availability">
                  {course.is_published ? "Available" : "Coming soon"}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Courses;
