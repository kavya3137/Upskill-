import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ManagerTeam.module.css"; // Import Module CSS

const ManagerTeam = () => {
  const [managerTeam, setManagerTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchManagerTeam = async () => {
      try {
        // Get manager_id from localStorage
        const managerId = localStorage.getItem("user_id");
        if (!managerId) {
          setError("Manager ID is missing from local storage.");
          return;
        }

        // Fetch team and courses for the manager
        const response = await axios.get(
          `http://localhost:5000/manager_team_with_courses?manager_id=${managerId}`
        );

        // Debugging step
        console.log("Manager team response:", response.data);

        if (response.data && response.data.manager_team) {
          setManagerTeam(response.data.manager_team);
        } else {
          setError("No manager team data received.");
        }
      } catch (err) {
        setError("Error fetching manager team and courses.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerTeam();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.managerTeam}>
      <h2>Manager's Team</h2>
      {managerTeam.length === 0 ? (
        <p>No learners assigned to this manager.</p>
      ) : (
        <div>
          {managerTeam.map((learner) => (
            <div key={learner.learner_id} className={styles.learnerCard}>
              <h3>{learner.learner_name}</h3>
              <p>{learner.learner_email}</p>

              <h4>Enrolled Courses:</h4>
              <ul>
                {learner.enrolled_courses && learner.enrolled_courses.length === 0 ? (
                  <li>No courses enrolled</li>
                ) : (
                  learner.enrolled_courses?.map((course) => (
                    <li key={course.course_id}>
                      <strong>Course ID:</strong> {course.course_id} <br />
                      <strong>Status:</strong>{" "}
                      <span
                        style={{
                          color:
                            course.status === "Enrolled"
                              ? "green"
                              : "red",
                        }}
                      >
                        {course.status}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerTeam;
