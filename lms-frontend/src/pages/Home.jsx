
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../services/api";

function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data.results || data);
      } catch (error) {
        console.error("Unable to load courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-text">
          <span className="hero-label">WELCOME TO LEARNHUB</span>

          <h1>
            Unlock Your Potential Through
            <span> Online Learning</span>
          </h1>

          <p>
            Discover exciting courses, learn valuable skills,
            and take the next step towards achieving your goals.
          </p>

          <Link to="/courses" className="hero-btn">
            Explore Courses
          </Link>
        </div>

        <div className="hero-image">
          <div className="learning-card">
            <div className="learning-icon"></div>
            <h2>Learn Something New Today!</h2>
            <p>Your future starts with knowledge.</p>
          </div>
        </div>
      </section>

      <section className="courses-section">
        <div className="section-heading">
          <span>START LEARNING</span>
          <h2>Explore Our Popular Courses</h2>
          <p>Find a course that matches your interests and goals.</p>
        </div>

        <div className="courses-grid">
          {courses.slice(0, 3).map((course) => (
            <article className="course-card" key={course.id}>
              <div className="course-icon">📚</div>

              <span className="course-category">
                {course.category}
              </span>

              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <div className="course-card-bottom">
                <span>{course.level || "Available"}</span>

                <Link to={`/courses/${course.id}`}>
                  Learn More →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="all-courses">
          <Link to="/courses" className="outline-course-btn">
            View All Courses
          </Link>
        </div>
      </section>

      <section className="why-section">
        <div className="section-heading">
          <span>WHY LEARNHUB?</span>
          <h2>Learning Made Simple</h2>
        </div>

        <div className="why-grid">
          <div>
            <h3>Quality Courses</h3>
            <p>
              Learn through organised lessons and useful learning materials.
            </p>
          </div>

          <div>
            <h3>Track Progress</h3>
            <p>
              Monitor your learning progress as you complete lessons.
            </p>
          </div>

          <div>
            <h3>Test Your Knowledge</h3>
            <p>
              Take quizzes and assessments to measure your understanding.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
