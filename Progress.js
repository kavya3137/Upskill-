import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const Progress = () => {
  const [courseProgress, setCourseProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  const getUserId = () => {
    const userId = localStorage.getItem('user_id');
    console.log("Retrieved user_id:", userId);
    return userId;
  };

  useEffect(() => {
    const fetchProgressData = async () => {
      const userId = getUserId();
      if (!userId) {
        console.error("No user_id found in localStorage");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/get-user-course-progress/${userId}`);
        if (response.data.data) {
          const uniqueCourses = [...new Map(response.data.data.map(course => [course.course_id, course])).values()];
          setCourseProgress(uniqueCourses);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course progress:', error);
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const getPieChartData = (correct, incorrect, unanswered) => ({
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    datasets: [
      {
        data: [correct, incorrect, unanswered],
        backgroundColor: ['green', 'red', 'gray'],
        hoverOffset: 4,
      },
    ],
  });

  return (
    <div style={{ padding: '20px', maxHeight: '100vh', overflow: 'auto' }}>
      {loading ? (
        <p>Loading progress...</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginTop: '20px',
          }}
        >
          <h2 style={{ gridColumn: 'span 3', textAlign: 'center', marginBottom: '20px' }}>
            User Course Progress
          </h2>
          {courseProgress.map((course, index) => (
            <div
              key={index}
              style={{
                border: '1px solid #ddd',
                borderRadius: '10px',
                padding: '15px',
                backgroundColor: '#fff',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <h3 style={{ fontSize: '18px', textAlign: 'center', marginBottom: '10px' }}>
                {course.course_title}
              </h3>
              <p>Progress</p>
              <div
                style={{
                  width: '100%',
                  backgroundColor: '#f3f3f3',
                  borderRadius: '25px',
                  overflow: 'hidden',
                  height: '20px',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: `${course.progress}%`,
                    height: '100%',
                    backgroundColor: course.progress === 100 ? 'green' : 'blue',
                    textAlign: 'center',
                    color: 'white',
                    lineHeight: '20px',
                    borderRadius: '25px',
                  }}
                >
                  {course.progress}%
                </div>
              </div>
              <p>Quiz Analysis</p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  marginBottom: '15px',
                }}
              >
                <Pie data={getPieChartData(course.correct_count, course.incorrect_count, course.unanswered_count)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Progress;
