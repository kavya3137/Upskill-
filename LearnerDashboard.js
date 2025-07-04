import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Learner.module.css'; 
import axios from 'axios';

const LearnerDashboard = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [userPoints, setUserPoints] = useState(null);  // State to store user points
  const [userId, setUserId] = useState(null); // State to store user ID
  const navigate = useNavigate();

  // Fetch user points when component loads
  useEffect(() => {
    const userIdFromStorage = localStorage.getItem('user_id');
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);  // Set user ID from localStorage

      // Fetch user points from the backend API
      const fetchUserPoints = async () => {
        try {
          const response = await axios.get(`http://127.0.0.1:5000/get-user-points?user_id=${userIdFromStorage}`);
          setUserPoints(response.data.total_points);  // Set points if successful
        } catch (error) {
          console.error('Error fetching user points:', error);
        }
      };

      fetchUserPoints();
    }
  }, []);  // Run once when the component mounts

  const handleMenuClick = (item) => {
    setActiveItem(item);
    switch (item) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'My Courses':
        navigate('/my-courses');
        break;
      case 'Enroll Courses':
        navigate('/get-courses');
        break;
      case 'Resources':
        navigate('/resources');
        break;
      case 'Notifications':
        navigate('/notifications');
        break;
      case 'Settings':
        navigate('/settings');
        break;
      case 'Logout':
        // Implement logout functionality, e.g., clearing authentication tokens
        navigate('/'); // Redirect to login page after logout
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>🐧</span>
        </div>
        <nav className={styles.menu}>
          {['Dashboard', 'My Courses', 'Enroll Courses', 'Resources', 'Notifications', 'Settings', 'Logout'].map((item) => (
            <a
              key={item}
              className={`${styles.menuItem} ${activeItem === item ? styles.active : ''}`}
              onClick={() => handleMenuClick(item)}
            >
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLinks}>
            <a href="#">Home</a>
            <a href="#">Career Help</a>
            <a href="#">About Us</a>
          </div>
        </header>
        <section className={styles.welcomeSection}>
          <div className={styles.welcomeHeader}>
            <h1>Welcome Back Learner</h1>
            <div className={styles.pointsContainer}>
              {userPoints !== null ? (
                <span className={styles.points}>
                  <span role="img" aria-label="fire">🔥</span> {userPoints} Points
                </span>
              ) : (
                <span>Loading...</span>
              )}
            </div>
          </div>
          <div className={styles.cardContainer}>
            <div className={styles.card}>
              <h2>View Courses</h2>
              <button className={styles.btn} onClick={() => navigate('/view-courses')}>View →</button>
            </div>
            <div className={styles.card}>
              <h2>My Courses</h2>
              <button className={styles.btn} onClick={() => navigate('/my-courses')}>View →</button>
            </div>
            <div className={styles.card}>
              <h2>Enroll Courses</h2>
              <button className={styles.btn} onClick={() => navigate('/get-courses')}>Enroll →</button>
            </div>
            <div className={styles.card}>
              <h2>Completed Courses</h2>
              <button className={styles.btn} onClick={() => navigate('/completed')}>View →</button>
            </div>
            <div className={styles.card}>
              <h2>Not Enrolled</h2>
              <button className={styles.btn} onClick={() => navigate('/notenrolled')}>View →</button>
            </div>
            <div className={styles.card}>
              <h2>View Progress</h2>
              <button className={styles.btn} onClick={() => navigate('/progress')}>View →</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LearnerDashboard;
