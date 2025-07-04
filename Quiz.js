import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register chart components
ChartJS.register(ArcElement, Tooltip, Legend);

const Quiz = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [message, setMessage] = useState('');
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [unansweredCount, setUnansweredCount] = useState(0);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/courses/${courseId}/quizzes`);
        if (response.data.quizzes) {
          setQuizzes(response.data.quizzes);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [courseId]);

  const handleAnswerChange = (quizId, option) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [quizId]: option,
    }));
  };

  const handleSubmit = async () => {
    let calculatedScore = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    quizzes.forEach((quiz) => {
      if (answers[quiz.id] === quiz.correct_option) {
        calculatedScore++;
        correct++;
      } else if (!answers[quiz.id]) {
        unanswered++;
      } else {
        incorrect++;
      }
    });

    setCorrectCount(correct);
    setIncorrectCount(incorrect);
    setUnansweredCount(unanswered);
    setScore(calculatedScore);
    setQuizCompleted(true);

    const userId = getUserId(); // Get the user ID

    try {
      await axios.post('http://localhost:5000/submit-quiz-result', {
        user_id: userId,
        course_id: courseId,
        correct_count: correct,
        incorrect_count: incorrect,
        unanswered_count: unanswered,
        score: calculatedScore,
      });

      if (calculatedScore >= 4) {
        setMessage('Congratulations! You have successfully completed the quiz.');
        await updateProgressInBackend(100);
      } else {
        setMessage('Thanks for taking the quiz! Better luck next time.');
      }
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const getUserId = () => {
    return localStorage.getItem('user_id'); // Get user ID from localStorage
  };

  const updateProgressInBackend = async (newProgress) => {
    const userId = getUserId();

    if (!userId) {
      console.error('User is not logged in!');
      return;
    }

    try {
      await axios.post('http://localhost:5000/update-progress', {
        user_id: userId,
        course_id: courseId,
        progress: newProgress,
      });
    } catch (error) {
      console.error('Error updating progress in backend:', error);
    }
  };

  const handleRetakeQuiz = () => {
    setQuizCompleted(false);
    setAnswers({});
    setScore(null);
    setMessage('');
    setCorrectCount(0);
    setIncorrectCount(0);
    setUnansweredCount(0);
  };

  const pieData = {
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    datasets: [
      {
        data: [correctCount, incorrectCount, unansweredCount],
        backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
        hoverBackgroundColor: ['#218838', '#c82333', '#e0a800'],
      },
    ],
  };

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
        height: '100vh',
        overflowY: 'auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {!quizCompleted ? (
        <>
          <h1 style={{ textAlign: 'center' }}>Quiz for Course: {courseId}</h1>
          {quizzes.length === 0 ? (
            <p>Loading questions...</p>
          ) : (
            quizzes.map((quiz, index) => (
              <div
                key={quiz.id}
                style={{
                  marginBottom: '10px',
                  padding: '12px',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                }}
              >
                <h3>{index + 1}. {quiz.question}</h3>
                {['A', 'B', 'C', 'D'].map((option) => (
                  <div key={option}>
                    <label>
                      <input
                        type="radio"
                        name={`quiz-${quiz.id}`}
                        value={option}
                        checked={answers[quiz.id] === option}
                        onChange={() => handleAnswerChange(quiz.id, option)}
                      />
                      {quiz[`option_${option.toLowerCase()}`]}
                    </label>
                  </div>
                ))}
              </div>
            ))
          )}
          <button
            onClick={handleSubmit}
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Submit
          </button>
        </>
      ) : (
        <>
          <h2>Quiz Result</h2>
          <p>Correct: {correctCount}</p>
          <p>Incorrect: {incorrectCount}</p>
          <p>Unanswered: {unansweredCount}</p>
          <p>Score: {score} / {quizzes.length}</p>
          <Pie data={pieData} />
          <p>{message}</p>
          <button
            onClick={() => navigate('/learner-dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleRetakeQuiz}
            style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '5px',
              marginLeft: '10px',
            }}
          >
            Retake Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default Quiz;
