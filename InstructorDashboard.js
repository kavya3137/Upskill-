import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./InstructorDashboard.module.css"; // Import the CSS module

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("Dashboard");

  // Navigation handlers
  const handleNavigation = (page, path) => {
    setActivePage(page);
    navigate(path);
  };

  const handleLogout = () => {
    console.log("Logout button clicked...");
    navigate("/");
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.sidebar}>
        <h2 className={styles.logo}>UPSKILL</h2>
        <ul className={styles.navList}>
          {[ 
            { name: "Dashboard", path: "/dashboard" },
            { name: "Create Course", path: "/create-new-course" },
            { name: "Edit Course", path: "/edit-course" },
            { name: "Enrollments", path: "/enrolled" },
            { name: "Notifications", path: "/notifications" },
            { name: "Settings", path: "/settings" },
          ].map((item) => (
            <li
              key={item.name}
              className={styles.navItem}
              style={{
                backgroundColor:
                  activePage === item.name ? "#004080" : "transparent",
              }}
              onClick={() => handleNavigation(item.name, item.path)}
            >
              {item.name}
            </li>
          ))}
          <li
            className={styles.navItem}
            style={{ cursor: "pointer", marginTop: "20px" }}
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      </div>
      <div className={styles.mainContent}>
        <h1 className={styles.welcome}>Welcome Back, Instructor!</h1>
        <div className={styles.cards}>
          {[ 
            { title: "Create Course", action: "/create-new-course" },
            { title: "View Courses", action: "/view-courses" },
            { title: "Edit Course", action: "/courses/edit/:courseId" },
            { title: "Enrollments", action: "/enrolled" },
            { title: "Add Quiz", action: "/adds-quiz" },
          ].map((card) => (
            <div key={card.title} className={styles.card}>
              <h3>{card.title}</h3>
              <button
                onClick={() => navigate(card.action)}
                className={styles.button}
              >
                {card.title === "Enrollments"
                  ? "View Enrollments →"
                  : "View →"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
