
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await api.get(`courses/${id}/`);
        setCourse(response.data);
      } catch (err) {
        setError("Unable to load course details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) return <p>Loading course...</p>;
  if (error) return <p>{error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>{course.title}</h1>

        <p>{course.description}</p>

        <h3>Course Price: KSh {course.price}</h3>

        <Link to="/courses" className="login-btn">
          Back to Courses
        </Link>
      </div>
    </div>
  );
}

export default CourseDetails;
