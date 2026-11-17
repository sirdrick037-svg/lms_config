
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCourses,
  getEnrollments,
  createCourse,
  getAdminUsers,
} from "../services/api";

function Courses() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = Boolean(user?.is_staff);

  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0",
    is_published: false,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        if (isAdmin) {
  const userData = await getAdminUsers();
  const allUsers = userData.results || userData;

  setInstructors(
    allUsers.filter((person) => person.role === "INSTRUCTOR")
  );
}

        try {
          const enrollmentData = await getEnrollments();
          const enrollments =
            enrollmentData.results || enrollmentData;

          setEnrolledCourseIds(
            enrollments.map((enrollment) =>
              Number(enrollment.course)
            )
          );
        } catch (err) {
          setEnrolledCourseIds([]);
        }
      } catch (err) {
        setError("Unable to load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    setCreating(true);
    setCreateMessage("");
    setCreateError("");

    try {
      const newCourse = await createCourse({
  ...formData,
  price: Number(formData.price),
  instructors: selectedInstructors,
});
      setCourses((previous) => [...previous, newCourse]);

      setFormData({
        title: "",
        description: "",
        price: "0",
        is_published: false,
      });
      setSelectedInstructors([]);

      setCreateMessage("Course created successfully!");
      setShowCreateForm(false);
    } catch (err) {
      const data = err.response?.data;

      setCreateError(
        data
          ? Object.entries(data)
              .map(([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages)
                    ? messages.join(", ")
                    : messages
                }`
              )
              .join(" | ")
          : "Unable to create course. Please try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const filteredCourses = courses.filter((course) =>
    `${course.title} ${course.category || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="courses-page">

      {isAdmin && (
  <div className="admin-course-controls">
    <button
      type="button"
      className="create-course-button"
      onClick={() => {
        setShowCreateForm(!showCreateForm);
        setCreateError("");
        setCreateMessage("");
      }}
    >
      {showCreateForm ? "Close Form" : "+ Create New Course"}
    </button>
  </div>
)}

      {isAdmin && showCreateForm && (
        <section className="create-course-section">
          <h2>Create a New Course</h2>
          <p>Enter the details of the course you want to add.</p>

          <form onSubmit={handleCreateCourse}>
            <label>Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter course title"
              required
            />

            <label>Course Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe what students will learn"
              rows="5"
              required
            />

            <label>Course Price (KES)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleFormChange}
              min="0"
              step="0.01"
              required
            />
            <label>Assign Instructors</label>

<div className="instructor-selection">
  {instructors.length === 0 ? (
    <p>No registered instructors available.</p>
  ) : (
    instructors.map((instructor) => (
      <label key={instructor.id}>
        <input
          type="checkbox"
          value={instructor.id}
          checked={selectedInstructors.includes(instructor.id)}
          onChange={(e) => {
            const instructorId = Number(e.target.value);

            setSelectedInstructors((previous) =>
              e.target.checked
                ? [...previous, instructorId]
                : previous.filter((id) => id !== instructorId)
            );
          }}
        />

        {instructor.username} ({instructor.email})
      </label>
    ))
  )}
</div>

            <label className="publish-course-label">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleFormChange}
              />
              Publish this course immediately
            </label>

            {createError && (
              <p className="error-message">{createError}</p>
            )}

            <button type="submit" disabled={creating}>
              {creating ? "Creating Course..." : "Save Course"}
            </button>
          </form>
        </section>
      )}

      {createMessage && (
        <p className="success-message">{createMessage}</p>
      )}

      <section className="courses-page-hero">
        <span>LEARN SOMETHING NEW</span>
        <h1>Explore Our Courses</h1>
        <p>
          Discover new skills, expand your knowledge and take
          the next step towards your future.
        </p>

        <input
          type="text"
          className="course-search"
          placeholder="Search for a course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </section>

      <section className="all-courses-section">
        <div className="courses-page-heading">
          <div>
            <span>FIND YOUR INTEREST</span>
            <h2>Available Courses</h2>
          </div>

          <p>{filteredCourses.length} courses found</p>
        </div>

        {loading && <p>Loading courses...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && filteredCourses.length === 0 && (
          <p className="no-courses">
            No courses found. Try another search.
          </p>
        )}

        {!loading && !error && (
          <div className="courses-grid">
            {filteredCourses.map((course) => {
              const isEnrolled = enrolledCourseIds.includes(
                Number(course.id)
              );

              return (
                <article className="course-card" key={course.id}>
                  <div className="course-icon">✦</div>

                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <div className="course-card-bottom">
                    <strong>
                      {Number(course.price) === 0
                        ? "Free"
                        : `KES ${course.price}`}
                    </strong>

                    <Link
                      to={`/courses/${course.id}`}
                      className="learn-more-btn"
                    >
                      {isAdmin
                        ? "View Course"
                        : isEnrolled
                          ? "Continue Learning"
                          : "Enroll Now"}
                    </Link>
                  </div>

                  <span className="course-availability">
                    {course.is_published
                      ? "Available"
                      : "Coming soon"}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Courses;
