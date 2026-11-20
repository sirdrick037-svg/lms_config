
import { useEffect, useState } from "react";
import { getInstructorMessages } from "../services/api";

function InstructorMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const data = await getInstructorMessages();
        setMessages(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "Unable to load student messages. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  return (
    <div className="instructor-messages-page">
      <div className="instructor-messages-hero">
        <h1>Student Messages</h1>
        <p>Messages sent to you by students enrolled in your courses.</p>
      </div>

      {loading && <p>Loading messages...</p>}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && messages.length === 0 && (
        <p>You have no student messages yet.</p>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="instructor-messages-list">
          {messages.map((message) => (
            <article className="instructor-message-card" key={message.id}>
              <h3>{message.subject}</h3>

              <p>
                <strong>From:</strong> {message.student_name}
              </p>

              <p>
                <strong>Course:</strong> {message.course_title}
              </p>

              <p className="instructor-message-content">
                {message.message}
              </p>

              <small>
                Received:{" "}
                {new Date(message.created_at).toLocaleString()}
              </small>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default InstructorMessages;
