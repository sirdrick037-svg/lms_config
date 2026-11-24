
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/api";

// Choose an icon based on the actual course title or category.
function getCourseIcon(course) {
  const text = `${course.title || ""} ${course.category || ""}`.toLowerCase();

  if (text.includes("python")) return "🐍";
  if (text.includes("database") || text.includes("sql")) return "🗄️";
  if (text.includes("cyber") || text.includes("security")) return "🛡️";
  if (text.includes("javascript")) return "🟨";
  if (text.includes("web")) return "🌐";
  if (text.includes("network")) return "🔗";
  if (text.includes("design")) return "🎨";
  if (text.includes("programming") || text.includes("coding")) return "💻";
  if (text.includes("computer") || text.includes("technology")) return "🖥️";

  return "📘";
}

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const courseData = await getCourses();

        const allCourses = Array.isArray(courseData)
          ? courseData
          : courseData.results || [];

        // Only show published courses on the homepage.
        setCourses(
          allCourses.filter((course) => course.is_published)
        );
      } catch (err) {
        console.error("Homepage course loading error:", err);
        setError("Unable to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const displayedCourses = showAll ? courses : courses.slice(0, 3);

  return (
    <div className="home-page">

      <section className="hero-section">
        <div className="hero-text">
          <span className="hero-label">WELCOME TO SKILLNEST</span>

          <h1>
            Build Your Skills.
            <span> Shape Your Future.</span>
          </h1>

          <p>
            Discover practical courses, learn at your own pace,
            and gain the knowledge you need to achieve your goals.
          </p>

          <Link to="/courses" className="hero-btn">
            Explore Courses
          </Link>
        </div>

        <div className="hero-image">
          <div className="learning-card">
            <div className="learning-icon">✦</div>
            <h2>Your Next Chapter Starts Here</h2>
            <p>Learn something new and move forward.</p>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="section-heading">
          <span>FIND YOUR PATH</span>
          <h2>Explore Our Courses</h2>
          <p>Choose a subject that interests you and start learning.</p>
        </div>

        {loading && (
          <p className="no-courses">Loading courses...</p>
        )}

        {error && (
          <p className="error-message">{error}</p>
        )}

        {!loading && !error && courses.length === 0 && (
          <p className="no-courses">
            No published courses are available right now.
            Please check back soon.
          </p>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="courses-grid">
              {displayedCourses.map((course) => (
                <article className="course-card" key={course.id}>
                  <div className="course-icon">
                    {getCourseIcon(course)}
                  </div>

                  <span className="course-category">
                    {course.category || "COURSE"}
                  </span>

                  <h3>{course.title}</h3>

                  <p>{course.description}</p>

                  <div className="course-card-bottom">
                    <span>{course.level || "Explore and learn"}</span>

                    <button
                      type="button"
                      onClick={() => setSelectedCourse(course)}
                    >
                      Learn More <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {courses.length > 3 && (
              <div className="all-courses">
                <button
                  type="button"
                  className="outline-course-btn"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Show Less" : "View More Courses"}
                </button>
              </div>
            )}
          </>
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
              {selectedCourse.category || "COURSE"}
            </span>

            <h2>{selectedCourse.title}</h2>

            <p className="modal-description">
              {selectedCourse.details || selectedCourse.description}
            </p>

            {(selectedCourse.level || selectedCourse.duration) && (
              <div className="modal-info">
                {selectedCourse.level && (
                  <span>Level: {selectedCourse.level}</span>
                )}

                {selectedCourse.duration && (
                  <span>Duration: {selectedCourse.duration}</span>
                )}
              </div>
            )}

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

      <section className="why-section">
        <div className="section-heading">
          <span>WHY SKILLNEST?</span>
          <h2>A Better Way to Learn</h2>
        </div>

        <div className="why-grid">
          <div>
            <h3>Quality Learning</h3>
            <p>
              Explore organised courses designed to help you build useful skills.
            </p>
          </div>

          <div>
            <h3>Learn at Your Pace</h3>
            <p>
              Take your time and develop your knowledge one lesson at a time.
            </p>
          </div>

          <div>
            <h3>Test Your Knowledge</h3>
            <p>
              Practise what you learn through quizzes and assessments.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;
