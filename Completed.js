import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./Completed.module.css"; // Importing modular CSS

const Completed = () => {
  const navigate = useNavigate();
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState(""); // State to capture user's name
  const [activeCourseId, setActiveCourseId] = useState(null); // For tracking which course the user is downloading

  const getUserId = () => {
    const userId = localStorage.getItem("user_id");
    console.log("Retrieved user_id:", userId);
    return userId;
  };

  const fetchCourseResources = async () => {
    const userId = getUserId();
    if (!userId) {
      console.error("User is not logged in!");
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:5000/completed_courses", {
        params: { user_id: userId },
      });
      setCompletedCourses(response.data.completed_courses);
    } catch (err) {
      setError("Failed to fetch completed courses");
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (courseId) => {
    const userId = getUserId();
    if (!userName.trim()) {
      alert("Please enter your name before downloading the certificate.");
      return;
    }
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/generate_certificate",
        { user_id: userId, course_id: courseId, user_name: userName },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Certificate_${courseId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Error generating certificate:", err);
      alert("Failed to download certificate.");
    }
  };

  useEffect(() => {
    fetchCourseResources();
  }, []);

  if (loading) return <p className={styles.loading}>Loading completed courses...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.root}>
      <h1 className={styles.heading}>Completed Courses</h1>
      <div className={styles.cardContainer}>
        {completedCourses.length > 0 ? (
          completedCourses.map((courseId) => (
            <div key={courseId} className={styles.card}>
              <h2 className={styles.cardTitle}>Course ID: {courseId}</h2>
              {activeCourseId === courseId && (
                <div className={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className={styles.nameInput}
                  />
                </div>
              )}
              <button
                className={styles.certificateButton}
                onClick={() => {
                  setActiveCourseId(courseId);
                  downloadCertificate(courseId);
                }}
              >
                Download Certificate
              </button>
            </div>
          ))
        ) : (
          <p className={styles.noCourses}>No completed courses yet.</p>
        )}
      </div>
      <button className={styles.backButton} onClick={() => navigate("/learner-dashboard")}>
        Back to Dashboard
      </button>
    </div>
  );
};

export default Completed;
