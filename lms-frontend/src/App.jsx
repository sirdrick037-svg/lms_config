
import "./App.css";

function App() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2 className="logo">LearnHub<span>.</span></h2>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#courses">Courses</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <button className="login-btn">Log In</button>
          <button className="signup-btn">Get Started</button>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR JOURNEY STARTS HERE</p>

            <h1>
              Learn new skills.
              <br />
              Build your <span>future.</span>
            </h1>

            <p className="hero-description">
              Explore online courses, learn at your own pace,
              and develop the skills you need to succeed.
            </p>

            <div className="hero-buttons">
              <button className="signup-btn">Explore Courses →</button>
              <button className="outline-btn">Join as a Student</button>
            </div>

            <div className="hero-stats">
              <div>
                <strong>Learn</strong>
                <p>At your own pace</p>
              </div>
              <div>
                <strong>Practice</strong>
                <p>Test your knowledge</p>
              </div>
              <div>
                <strong>Grow</strong>
                <p>Build your future</p>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-icon">🎓</div>
            <h3>Your next chapter starts today.</h3>
            <p>Discover courses. Master skills. Reach your goals.</p>
            <div className="visual-decoration">LEARN • PRACTICE • SUCCEED</div>
          </div>
        </section>

        <section className="features" id="courses">
          <p className="eyebrow">WHY LEARN WITH US?</p>
          <h2>A better way to learn</h2>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Expert-led courses</h3>
              <p>Explore subjects and build practical knowledge.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">📈</div>
              <h3>Track your progress</h3>
              <p>Follow your learning journey lesson by lesson.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Test your skills</h3>
              <p>Complete assessments and see how much you learn.</p>
            </article>
          </div>
        </section>
      </main>

      <footer id="about">
        <p>© 2026 LearnHub. Built for curious minds.</p>
      </footer>
    </div>
  );
}

export default App;
