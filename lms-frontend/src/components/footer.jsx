
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        <div className="footer-brand">
          <h2>SkillNest<span>.</span></h2>
          <p>Learn new skills. Build your future.</p>
          <p className="footer-description">
            A place to discover knowledge, develop practical skills
            and create new opportunities through learning.
          </p>
        </div>

        <div className="footer-navigation">
          <h3>Quick Links</h3>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© 2026 SkillNest. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
