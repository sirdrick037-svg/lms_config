
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <span>ABOUT SKILLNEST</span>
        <h1>Learning Today, Building Tomorrow.</h1>
        <p>
          We believe everyone deserves an opportunity to learn,
          grow and build a better future through education.
        </p>
      </section>

      <section className="about-story">
        <div>
          <span>OUR STORY</span>
          <h2>Welcome to SkillNest</h2>
          <p>
            SkillNest is an online learning platform designed to make
            learning accessible, flexible and meaningful. We bring
            learners and valuable knowledge together through courses
            that help develop practical skills.
          </p>
          <p>
            Whether you are starting your learning journey or improving
            your existing skills, SkillNest gives you a place to grow
            at your own pace.
          </p>
        </div>
      </section>

      <section className="about-values">
        <article>
          <h2>Our Mission</h2>
          <p>
            To make quality learning accessible and empower learners
            with practical knowledge and skills for their future.
          </p>
        </article>

        <article>
          <h2>Our Vision</h2>
          <p>
            To become a trusted learning community where people can
            discover opportunities, develop their abilities and
            achieve their goals.
          </p>
        </article>
      </section>

      <section className="about-why">
        <span>WHY SKILLNEST?</span>
        <h2>A Better Way to Learn</h2>

        <div className="about-why-grid">
          <article>
            <h3>Flexible Learning</h3>
            <p>Learn at your own pace and manage your learning journey.</p>
          </article>

          <article>
            <h3>Practical Skills</h3>
            <p>Explore courses that help you develop useful knowledge.</p>
          </article>

          <article>
            <h3>Accessible Education</h3>
            <p>Discover learning opportunities from wherever you are.</p>
          </article>
        </div>

        <Link to="/courses" className="about-btn">
          Explore Our Courses
        </Link>
      </section>
    </div>
  );
}

export default About;
