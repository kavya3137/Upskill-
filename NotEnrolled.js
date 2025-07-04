import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NotEnrolled = () => {
  const [notEnrolledCourses, setNotEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUserId = () => {
    const userId = localStorage.getItem('user_id');
    console.log("Retrieved user_id:", userId);
    return userId;
  };

  useEffect(() => {
    const fetchNotEnrolledCourses = async () => {
      const userId = getUserId();

      if (!userId) {
        console.error('User is not logged in!');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('http://127.0.0.1:5000/get-not-enrolled-courses', {
          params: { user_id: userId },
        });

        setNotEnrolledCourses(response.data.not_enrolled_courses || []);
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchNotEnrolledCourses();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Courses Not Enrolled</h2>
      <div style={styles.courseContainer}>
        {notEnrolledCourses.length > 0 ? (
          notEnrolledCourses.map((course) => (
            <div key={course.course_id} style={styles.courseCard}>
              <h3 style={styles.courseTitle}>{course.course_title}</h3>
              <p><strong>Description:</strong> {course.description}</p>
              <p><strong>Instructor:</strong> {course.instructor_name}</p>
              <p><strong>Start Date:</strong> {course.start_date || 'TBA'}</p>
              <p><strong>End Date:</strong> {course.end_date || 'TBA'}</p>
            </div>
          ))
        ) : (
          <p>No courses available for enrollment.</p>
        )}
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={() => navigate('/learner-dashboard')} style={styles.button}>
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  courseContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
  },
  courseCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
    width: '300px',
    padding: '20px',
    backgroundColor: '#fefefe',
    transition: 'transform 0.3s',
  },
  courseCardHover: {
    transform: 'scale(1.05)',
  },
  courseTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
    color: '#007bff',
  },
  buttonContainer: {
    textAlign: 'center',
    marginTop: '40px',
  },
  button: {
    padding: '15px 20px',
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.3s',
  },
  buttonHover: {
    backgroundColor: '#218838',
  },
};

export default NotEnrolled;
