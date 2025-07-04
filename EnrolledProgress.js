import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EnrolledProgress.module.css"; // Assuming you're using CSS Modules

const EnrolledProgress = () => {
  const [enrolledProgress, setEnrolledProgress] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all enrolled progress
  useEffect(() => {
    const fetchEnrolledProgress = async () => {
      try {
        const response = await axios.get("http://localhost:5000/all_enrolled_progress");
        console.log(response.data); // Log response to check if it's correct
        if (response.data && response.data.data) {
          setEnrolledProgress(response.data.data);
        } else {
          setError("No progress data available.");
        }
      } catch (err) {
        console.error("Error fetching enrolled progress:", err);
        setError("Failed to fetch enrolled progress.");
      }
    };

    fetchEnrolledProgress();
  }, []);

  // Error handling
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Grouping data by Course ID for relational display
  const groupedByCourse = enrolledProgress.reduce((acc, progress) => {
    if (!acc[progress.course_id]) {
      acc[progress.course_id] = [];
    }
    acc[progress.course_id].push(progress);
    return acc;
  }, {});

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Enrollment Progress</h1>

      {Object.keys(groupedByCourse).length === 0 ? (
        <p className={styles.noData}>No progress data available.</p>
      ) : (
        <div>
          {Object.keys(groupedByCourse).map((courseId) => (
            <div key={courseId}>
              <h2 className={styles.courseTitle}>Course ID: {courseId}</h2>
              <div className={styles.scrollableTableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Progress Percentage</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedByCourse[courseId].map((progress, index) => (
                      <tr key={index}>
                        <td>{progress.user_id}</td>
                        <td>{progress.progress_percentage}%</td>
                        <td>
                          {progress.progress_percentage === 100
                            ? "Completed"
                            : "Progress"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnrolledProgress;
