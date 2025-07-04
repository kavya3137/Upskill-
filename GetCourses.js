import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './GetCourses.css';  // Ensure your CSS file has the correct styles

const GetCourses = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Retrieve user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    
    console.log('User ID from localStorage:', storedUserId);  // Log to check if user_id is correctly retrieved

    if (!storedUserId) {
      setError('User is not logged in');
      return;
    }

    // Fetch courses and their enrollment status
    axios.get(`http://localhost:5000/get-courses?user_id=${storedUserId}`)
      .then(response => {
        console.log('Courses data:', response.data.courses);  // Log to check the course data structure
        setCourses(response.data.courses);
      })
      .catch(error => {
        setError('Error fetching courses');
        console.error('Error:', error);
      });
  }, []);  // Empty dependency array to run only once on component mount

  const handleEnroll = (courseId) => {
    // Retrieve user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    
    console.log('User ID for enrollment:', storedUserId);  // Log to check user_id before sending to backend

    if (!storedUserId) {
      alert('User is not logged in');
      return;
    }

    // Enroll in the course
    axios.post('http://localhost:5000/enroll-course', { user_id: storedUserId, course_id: courseId })
      .then(response => {
        alert(response.data.message);
        // Optionally refresh course data to update status
        setCourses(prevCourses =>
          prevCourses.map(course =>
            course.course_id === courseId
              ? { ...course, status: 'Enrolled' }
              : course
          )
        );
      })
      .catch(error => {
        alert(error.response?.data?.error || 'Error enrolling in the course');
        console.error('Enrollment Error:', error);
      });
  };

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      {error && <p className="error">{error}</p>}
      <div className="courses-list">
        {courses.length > 0 ? (
          courses.map(course => (
            <div key={course.course_id} className="course-card">
              <h3>{course.course_title}</h3>
              <p>Description: {course.description}</p>
              <p>Instructor: {course.instructor_name}</p>
              <p>Start Date: {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'N/A'}</p>
              <p>Status: {course.status}</p>

              {course.status === 'Not Enrolled' && (
                <button className="enroll-btn" onClick={() => handleEnroll(course.course_id)}>Enroll</button>
              )}
              {course.status === 'Enrolled' && (
                <button className="enrolled-btn" disabled>Enrolled</button>
              )}
            </div>
          ))
        ) : (
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
};

export default GetCourses;