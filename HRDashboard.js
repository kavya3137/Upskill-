import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HRDashboard.module.css";

const HRDashboard = () => {
  const navigate = useNavigate();

  const handleCreateCourse = () => {
    navigate("/create-new-course");
  };

  const handleViewCourses = () => {
    navigate("/view-courses");
  };

  const handleManageStudents = () => {
    navigate("/manage-students");
  };

  const handleEditCourse = () => {
    navigate("/courses/edit/:courseId"); // Replace with dynamic route or predefined ID if needed
  };

  const handleTrackChanges = () => {
    navigate("/track-changes"); // Redirect to Track Changes page
  };

  const handleAddQuiz = () => {
    navigate("/adds-quiz"); // Redirect to Add Quiz page
  };

  const handleLogout = () => {
    console.log("Logout button clicked...");
    navigate("/");
  };
  const handleEnrolledProgress = () => {
    navigate("/enrolledprogress"); // Redirect to Track Changes page
  };
  const handleviewuser = () => {
    navigate("/filter-progress"); // Redirect to Track Changes page
  };

  return (
    <div className={styles.dashboard}>
      

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h2 className={styles.logo}>UPSKILL</h2>
        <ul className={styles["nav-list"]}>
          <li className={styles["nav-item"]}>Dashboard</li>
          <li className={styles["nav-item"]} onClick={handleCreateCourse}>
            Create Course
          </li>
          <li className={styles["nav-item"]} onClick={handleViewCourses}>
            View Courses
          </li>
          <li className={styles["nav-item"]} onClick={handleManageStudents}>
            Pending Approvals
          </li>
          <li className={styles["nav-item"]} onClick={handleEditCourse}>
            Edit Course
          </li>
          <li className={styles["nav-item"]} onClick={handleAddQuiz}>
            Add Quiz
          </li>
          <li className={styles["nav-item"]} onClick={handleTrackChanges}>
            Track Changes
          </li>
          <li className={styles["nav-item"]}>Notifications</li>
          <li className={styles["nav-item"]}>Settings</li>
          <li
            className={`${styles["nav-item"]} ${styles.logout}`}
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={styles["main-content"]}>
        <h1 className={styles.welcome}>Welcome Back, HR!</h1>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h2>Create Course</h2>
            <button
              onClick={handleCreateCourse}
              className={styles.button}
            >
              Create →
            </button>
          </div>
          <div className={styles.card}>
            <h2>View Courses</h2>
            <button
              onClick={handleViewCourses}
              className={styles.button}
            >
              View →
            </button>
          </div>
          <div className={styles.card}>
            <h2>Pending Approvals</h2>
            <button
              onClick={handleManageStudents}
              className={styles.button}
            >
              Manage →
            </button>
          </div>
          <div className={styles.card}>
            <h2>Edit Course</h2>
            <button onClick={handleEditCourse} className={styles.button}>
              Edit →
            </button>
          </div>
          <div className={styles.card}>
            <h2>Add Quiz</h2>
            <button onClick={handleAddQuiz} className={styles.button}>
              Add →
            </button>
          </div>
          <div className={styles.card}>
            <h2>View UserProgress</h2>
            <button
              onClick={handleEnrolledProgress}
              className={styles.button}
            >
              view →
            </button>
            </div>
            <div className={styles.card}>
            <h2>View Progress</h2>
            <button
              onClick={handleviewuser}
              className={styles.button}
            >
              view →
            </button>
            </div>
          <div className={styles.card}>
            <h2>Track Changes</h2>
            <button
              onClick={handleTrackChanges}
              className={styles.button}
            >
              Track →
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
