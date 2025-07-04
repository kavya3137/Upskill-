import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyCourses.module.css'; // Import the CSS module

const MyCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    const userId = localStorage.getItem('user_id');
    if (userId) {
      try {
        const response = await fetch(`http://localhost:5000/get-enrolled-courses?user_id=${userId}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        if (data.error) {
          alert(data.error);
        } else {
          // Fetch progress for each course
          const coursesWithProgress = await Promise.all(data.enrolled_courses.map(async (course) => {
            const progressResponse = await fetch(`http://localhost:5000/get-progress/${userId}/${course.course_id}`);
            const progressData = await progressResponse.json();
            course.progress = progressData.progress || 0; // Set progress, default to 0 if none
            return course;
          }));
          setEnrolledCourses(coursesWithProgress);
        }
      } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        alert('Error fetching courses: ' + error.message);
      }
    } else {
      alert('User ID is missing');
    }
  };

  const handleStartCourse = (courseId) => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('User ID is missing');
      return;
    }

    // Find the course with the matching courseId
    const course = enrolledCourses.find(course => course.course_id === courseId);

    // Navigate to the course learning page
    navigate(`/courses/${courseId}/learn`);
  };

  return (
    <div className={styles.myCoursesContainer}>
      <h1>My Enrolled Courses</h1>
      {enrolledCourses.length === 0 ? (
        <p>No courses found. Please enroll in courses.</p>
      ) : (
        <div className={styles.courseList}>
          {enrolledCourses.map((course) => {
            const duration = `${new Date(course.start_date).toLocaleDateString()} - ${new Date(course.end_date).toLocaleDateString()}`;
            return (
              <div key={course.course_id} className={styles.courseCard}>
                <h2>{course.course_title}</h2>
                <p><strong>Instructor:</strong> {course.instructor_name}</p>
                <p><strong>Enrollment Date:</strong> {new Date(course.enrollment_date).toLocaleDateString()}</p>
                <p><strong>Duration:</strong> {duration}</p>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                  <div
                    className={styles.progressBar}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                {/* Button Logic */}
                {course.progress === 100 ? (
                  <button className={styles.btnCompleted} disabled>
                    Completed
                  </button>
                ) : course.progress > 0 ? (
                  // Display "Continue" for in-progress courses
                  <button
                    className={styles.btnProgress}
                    onClick={() => navigate(`/courses/${course.course_id}/learn`)}
                  >
                    Continue - {course.progress}%
                  </button>
                ) : (
                  <button
                    className={styles.btnPrimary}
                    onClick={() => handleStartCourse(course.course_id)}
                  >
                    Start Course
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
