import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Enrolled.module.css"; // Using CSS module for scoped styles

const Enrolled = () => {
  const [allEnrollments, setAllEnrollments] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await axios.get("http://localhost:5000/get-all-enrollments");
        console.log(response.data); // Log response to check if it's correct
        if (response.data && response.data.all_enrollments) {
          setAllEnrollments(response.data.all_enrollments);
        } else {
          setError("No enrollments data available.");
        }
      } catch (err) {
        console.error("Error fetching enrollments:", err);
        setError("Failed to fetch enrollments.");
      }
    };

    fetchEnrollments();
  }, []);

  // Error handling
  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>All Enrollments</h1>

      {allEnrollments.length === 0 ? (
        <p className={styles.noData}>No courses available.</p>
      ) : (
        <div className={styles.scrollableContainer}>
          {allEnrollments.map((course, index) => (
            <div key={index} className={styles.courseCard}>
              <h2 className={styles.courseTitle}>{course.course_title}</h2>
              <h4>Instructor: {course.instructor_name}</h4>

              {course.enrollments.length === 0 ? (
                <p className={styles.noData}>No students enrolled in this course.</p>
              ) : (
                <div className={styles.enrollmentList}>
                  {course.enrollments.map((enrollment, idx) => (
                    <div key={idx} className={styles.enrollmentCard}>
                      <div className={styles.enrollmentInfo}>
                        <h4 className={styles.userName}>{enrollment.user_name}</h4>
                        <p><strong>Email:</strong> {enrollment.email}</p>
                        <p><strong>Phone:</strong> {enrollment.phone_number}</p>
                        <p><strong>Role:</strong> {enrollment.role}</p>
                        <p><strong>Status:</strong> {enrollment.status}</p>
                        <p><strong>Enrollment Date:</strong> {enrollment.enrollment_date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Enrolled;
