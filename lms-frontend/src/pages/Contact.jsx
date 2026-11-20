
import { useState } from "react";
import { submitContactMessage } from "../services/api";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    try {
      await submitContactMessage(formData);

      setSuccess(
        "Thank you for contacting SkillNest! Your message has been received."
      );

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.values(responseData).flat();
        setError(messages.join(" "));
      } else {
        setError("Unable to send your message. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <span className="contact-eyebrow">WE'D LOVE TO HEAR FROM YOU</span>
        <h1>Get in Touch</h1>
        <p>
          Have a question or need help? Send us a message and the
          SkillNest team will be happy to hear from you.
        </p>
      </section>

      <section className="contact-content">
        <div className="contact-info">
          <h2>Let's Talk</h2>
          <p>
            Whether you have a question about our courses, need
            assistance or simply want to share feedback, use the
            form to get in touch with us.
          </p>

          <div className="contact-info-note">
            <h3>We're listening.</h3>
            <p>
              Your message will be received by the SkillNest
              administration team.
            </p>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send Us a Message</h2>

          {success && (
            <div className="contact-success">{success}</div>
          )}

          {error && (
            <div className="contact-error">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <label htmlFor="contact-name">Full Name</label>
            <input
              id="contact-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              maxLength={150}
              required
            />

            <label htmlFor="contact-email">Email Address</label>
            <input
              id="contact-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />

            <label htmlFor="contact-subject">Subject</label>
            <input
              id="contact-subject"
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="What is your message about?"
              maxLength={200}
              required
            />

            <label htmlFor="contact-message">Your Message</label>
            <textarea
              id="contact-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              rows="6"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Contact;
