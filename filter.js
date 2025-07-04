import React, { useState } from 'react';
import axios from 'axios';

function FilterProgress() {
  const [userId, setUserId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUserIdChange = (e) => setUserId(e.target.value);
  const handleCourseIdChange = (e) => setCourseId(e.target.value);

  const fetchProgress = async () => {
    if (!userId && !courseId) {
      setError('Please provide at least one of User ID or Course ID.');
      return;
    }

    setError('');
    setLoading(true);

    // Prepare the query parameters
    const params = new URLSearchParams();
    if (userId) params.append('user_id', userId);
    if (courseId) params.append('course_id', courseId);

    try {
      const response = await axios.get('http://127.0.0.1:5000/manager/team-course-progress/filter-by-course', { params });
      setProgressData(response.data.progress);
      setError('');
    } catch (err) {
      setError('Error fetching data. Please check the inputs or try again.');
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Filter Team Course Progress</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={handleUserIdChange}
          style={{
            marginRight: '10px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '180px'
          }}
        />
        <input
          type="text"
          placeholder="Enter Course ID"
          value={courseId}
          onChange={handleCourseIdChange}
          style={{
            marginRight: '10px',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            width: '180px'
          }}
        />
        <button
          onClick={fetchProgress}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Loading...' : 'Filter Progress'}
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '20px', fontWeight: 'bold' }}>{error}</div>}

      <div style={{ marginTop: '30px' }}>
        {loading && <p>Loading data...</p>}
        {progressData.length > 0 ? (
          <div style={{ overflowY: 'auto', maxHeight: '400px' }}> {/* Added scroll functionality */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2', fontSize: '18px' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Course Title</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Progress (%)</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {progressData.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff' }}>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.user_id}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.user_email}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.course_title}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{item.progress}%</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {item.score === 'Not Attempted' ? 'Not Attempted' : item.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && <p>No data available for the given filters.</p>
        )}
      </div>
    </div>
  );
}

export default FilterProgress;
