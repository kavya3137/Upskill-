import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Learn.css'; // Import the CSS file

const Learn = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [completedResources, setCompletedResources] = useState({});
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getUserId = () => {
    const userId = localStorage.getItem('user_id');
    return userId;
  };

  const fetchCourseResources = async () => {
    const userId = getUserId();
    if (!userId) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/courses/${courseId}/resources`);
      setResources(response.data.resources);

      const initialCompletionState = response.data.resources.reduce((acc, resource) => {
        acc[resource.id] = false;
        return acc;
      }, {});
      setCompletedResources(initialCompletionState);

      const progressResponse = await axios.get(`http://localhost:5000/get-progress/${userId}/${courseId}`);
      if (progressResponse.data.progress !== undefined) {
        setProgress(progressResponse.data.progress);
      }

      if (progressResponse.data.progress >= 60) {
        setIsCompleted(true);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseResources();
  }, [courseId]);

  const handleComplete = (resourceId) => {
    if (completedResources[resourceId]) {
      alert('This resource is already marked as complete.');
      return;
    }

    setCompletedResources((prev) => {
      const updated = { ...prev, [resourceId]: true };
      const completedCount = Object.values(updated).filter(Boolean).length;
      const newProgress = Math.min(completedCount * 30, 60);

      if (newProgress > progress) {
        setProgress(newProgress);
        updateProgressInBackend(newProgress);
      }

      return updated;
    });
  };

  const updateProgressInBackend = async (newProgress) => {
    const userId = getUserId();
    if (!userId) return;

    try {
      await axios.post('http://localhost:5000/update-progress', {
        user_id: userId,
        course_id: courseId,
        progress: newProgress,
      });
    } catch (error) {}
  };

  const handleTakeQuiz = () => {
    navigate(`/courses/${courseId}/quiz`);
  };

  const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/);
    return match ? match[1] : null;
  };

  return (
    <div className="learn-container">
      <h1>Learn Course: {courseId}</h1>
      {isLoading ? (
        <div>Loading resources...</div>
      ) : (
        <div>
          <div className="resources-grid">
            <div className="video-section">
              <h2>Videos</h2>
              {resources
                .filter((resource) => resource.resource_type === 'Video')
                .map((resource) => (
                  <div key={resource.id} className="resource-card">
                    <h3>{resource.title}</h3>
                    <iframe
                      width="100%"
                      height="250"
                      src={`https://www.youtube.com/embed/${extractYouTubeVideoId(resource.url)}`}
                      title={resource.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                    {!completedResources[resource.id] ? (
                      <button onClick={() => handleComplete(resource.id)} className="complete-btn">
                        Mark as Complete
                      </button>
                    ) : (
                      <span className="completed-label">Completed</span>
                    )}
                  </div>
                ))}
            </div>

            <div className="pdf-section">
              <h2>PDFs</h2>
              {resources
                .filter((resource) => resource.resource_type === 'PDF')
                .map((resource) => (
                  <div key={resource.id} className="resource-card">
                    <h3>{resource.title}</h3>
                    <embed
                      src={resource.url}
                      type="application/pdf"
                      width="100%"
                      height="250px"
                      className="pdf-viewer"
                    />
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="open-pdf-btn"
                    >
                      Open in New Tab
                    </a>
                    {!completedResources[resource.id] ? (
                      <button onClick={() => handleComplete(resource.id)} className="complete-btn">
                        Mark as Complete
                      </button>
                    ) : (
                      <span className="completed-label">Completed</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <h2>Progress: {progress}%</h2>
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%`, backgroundColor: progress >= 100 ? 'green' : 'blue' }}
            ></div>
          </div>
          {progress >= 60 && progress < 100 && (
            <button onClick={handleTakeQuiz} className="take-quiz-btn">
              Take Quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Learn;
