import React, { useEffect, useState } from "react";
import axios from "axios";

const ViewCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/view-courses")
      .then((response) => {
        if (response.data && response.data.courses && Array.isArray(response.data.courses)) {
          setCourses(response.data.courses);
        } else {
          setError("Unexpected API response structure.");
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("Failed to load courses. Please try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={styles.loading}>Loading courses...</p>;
  }

  if (error) {
    return <p style={styles.error}>Error: {error}</p>;
  }

  if (courses.length === 0) {
    return <p style={styles.noCourses}>No courses available.</p>;
  }

  return (
    <div style={styles.root}>
      <h1 style={styles.heading}>Courses</h1>
      <div style={styles.cardContainer}>
        {courses.map((course) => (
          <div key={course.course_id} style={styles.card}>
            <h2 style={styles.cardTitle}>{course.course_title}</h2>
            <p style={styles.cardDetail}><strong>Course ID:</strong> {course.course_id}</p>
            <p style={styles.cardDetail}><strong>Description:</strong> {course.description}</p>
            <p style={styles.cardDetail}><strong>Instructor:</strong> {course.instructor_name}</p>
            <p style={styles.cardDetail}><strong>Start Date:</strong> {course.start_date}</p>
            <p style={styles.cardDetail}><strong>End Date:</strong> {course.end_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
const styles = {
  root: {
    padding: "30px 15px",
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  heading: {
    textAlign: "center",
    color: "#333",
    marginBottom: "30px",
    fontSize: "28px",
    fontWeight: "600",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    maxHeight: "600px", // Slightly reduced height for the container
    overflowY: "auto", // Keeps vertical scroll
    padding: "15px", // Slightly reduced padding for more compactness
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    width: "320px", // Slightly reduced width of cards
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#4f92d1",
    marginBottom: "10px",
  },
  cardDetail: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "8px",
  },
  loading: {
    textAlign: "center",
    fontSize: "18px",
    color: "#555",
  },
  error: {
    textAlign: "center",
    fontSize: "18px",
    color: "#e74c3c",
  },
  noCourses: {
    textAlign: "center",
    fontSize: "18px",
    color: "#777",
  },
};


export default ViewCourses;
