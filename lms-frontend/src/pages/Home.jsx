
const courses = [
  {
    title: "Python Programming",
    category: "Programming",
    description: "Learn Python from the basics to practical programming.",
    level: "Beginner",
  },
  {
    title: "Database Management",
    category: "Technology",
    description: "Understand databases, SQL and data management.",
    level: "Intermediate",
  },
  {
    title: "Cybersecurity",
    category: "Security",
    description: "Discover network security and online protection.",
    level: "Beginner",
  },
];

function Home() {
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

          <a href="/courses" className="explore-btn">
            Explore Courses →
          </a>
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
          {courses.map((course, index) => (
            <article className="course-card" key={index}>
              <div className="course-icon">{course.icon}</div>

              <span className="course-category">
                {course.category}
              </span>

              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <div className="course-card-bottom">
                <span>{course.level}</span>
                <a href="/courses">Learn More →</a>
              </div>
            </article>
          ))}
        </div>

        <div className="all-courses">
          <a href="/courses" className="outline-course-btn">
            View All Courses
          </a>
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
            <p>Learn through organised lessons and useful learning materials.</p>
          </div>

          <div>
            <h3>Track Progress</h3>
            <p>Monitor your learning progress as you complete lessons.</p>
          </div>

          <div>
            <h3> Test Your Knowledge</h3>
            <p>Take quizzes and assessments to measure your understanding.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
