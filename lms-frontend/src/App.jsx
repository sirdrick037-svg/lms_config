
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

function App() {
  return (
    <>
      <Header />

      <main className="main-content">
        <section className="welcome-section">
          <h1>Welcome to LearnHub</h1>

          <p>
            Learn new skills, explore exciting courses,
            and build your future with us.
          </p>

          <button className="explore-btn">
            Explore Courses
          </button>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default App;
