
import { useState } from "react";
import { Link } from "react-router-dom";

const courses = [
  {
    title: "Python Programming",
    category: "Programming",
    description: "Learn Python from the basics to practical programming.",
    level: "Beginner",
    duration: "8 Weeks",
    details: "Start your programming journey with Python. Learn variables, data types, conditions, loops, functions and object-oriented programming. You will also practise by creating small projects that help you develop real programming skills.",
  },
  {
    title: "Database Management",
    category: "Technology",
    description: "Understand databases, SQL and data management.",
    level: "Intermediate",
    duration: "6 Weeks",
    details: "Learn how databases work and how information is stored and organised. Explore SQL, database design, tables, relationships and queries. By the end, you will understand how to manage and retrieve data efficiently.",
  },
  {
    title: "Cybersecurity",
    category: "Security",
    description: "Discover network security and online protection.",
    level: "Beginner",
    duration: "7 Weeks",
    details: "Discover the world of cybersecurity. Learn about online threats, malware, phishing, passwords, network protection and safe internet practices. Understand how individuals and organisations protect their information.",
  },
  {
    title: "JavaScript Fundamentals",
    category: "Programming",
    description: "Learn to create interactive and dynamic websites.",
    level: "Beginner",
    duration: "8 Weeks",
    details: "Explore JavaScript from the beginning. Learn variables, functions, arrays, objects, events and DOM manipulation. Practise building interactive web pages and understand how JavaScript powers modern websites.",
  },
  {
    title: "Web Development",
    category: "Programming",
    description: "Learn how to design and build modern websites.",
    level: "Beginner",
    duration: "10 Weeks",
    details: "Build your web development skills using HTML, CSS and JavaScript. Learn how to structure web pages, style layouts, make websites responsive and create attractive user experiences.",
  },
  {
    title: "Computer Networks",
    category: "Technology",
    description: "Understand how computers communicate with each other.",
    level: "Intermediate",
    duration: "6 Weeks",
    details: "Study computer networking concepts including IP addresses, network devices, protocols, network topologies and internet communication. Develop an understanding of how computer networks operate.",
  },
];

function Home() {
  const [showAll, setShowAll] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

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

        <div className="courses-grid">
          {displayedCourses.map((course) => (
            <article className="course-card" key={course.title}>
              <div className="course-icon">✦</div>

              <span className="course-category">
                {course.category}
              </span>

              <h3>{course.title}</h3>

              <p>{course.description}</p>

              <div className="course-card-bottom">
                <span>{course.level}</span>

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

        <div className="all-courses">
          <button
            type="button"
            className="outline-course-btn"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show Less" : "View More Courses"}
          </button>
        </div>
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
              {selectedCourse.category}
            </span>

            <h2>{selectedCourse.title}</h2>

            <p className="modal-description">
              {selectedCourse.details}
            </p>

            <div className="modal-info">
              <span>Level: {selectedCourse.level}</span>
              <span>Duration: {selectedCourse.duration}</span>
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
