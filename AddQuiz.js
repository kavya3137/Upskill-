import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AddQuiz.css"; // Import the updated CSS file

const AddQuiz = () => {
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState([]);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState("");
  const [numQuestions, setNumQuestions] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsData, setQuestionsData] = useState([]);
  const [message, setMessage] = useState("");
  const [isCourseValid, setIsCourseValid] = useState(true);
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/fetch-courses");
        setCourses(response.data.courses);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validateCourseId = (inputCourseId) => {
    const isValid = courses.some((course) => course.course_id === inputCourseId);
    setIsCourseValid(isValid);
    return isValid;
  };

  const handleCourseIdChange = (e) => {
    const inputCourseId = e.target.value;
    setCourseId(inputCourseId);
    validateCourseId(inputCourseId);
  };

  const handleSubmitQuestion = () => {
    if (!isCourseValid) {
      setMessage("Course ID does not exist. Please enter a valid course ID.");
      return;
    }

    if (!question || !correctOption || options.some((option) => option === "")) {
      setMessage("Please fill all fields before submitting.");
      return;
    }

    const currentQuestion = {
      question,
      options,
      correct_option: correctOption,
    };

    setQuestionsData([...questionsData, currentQuestion]);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrectOption("");

    if (currentQuestionIndex + 1 >= numQuestions) {
      setMessage("Quiz ready to submit!");
    }
  };

  const handleSubmitQuiz = async () => {
    if (!isCourseValid) {
      setMessage("Course ID does not exist. Please enter a valid course ID.");
      return;
    }

    try {
      for (let i = 0; i < questionsData.length; i++) {
        const questionData = {
          course_id: courseId,
          question: questionsData[i].question,
          options: questionsData[i].options,
          correct_option: questionsData[i].correct_option,
        };

        await axios.post("http://127.0.0.1:5000/add-quiz", questionData);
      }

      setIsQuizSubmitted(true);
      setCourseId("");
      setQuestionsData([]);
      setNumQuestions(1);
      setCurrentQuestionIndex(0);
      setMessage("Quiz submitted successfully!");
    } catch (error) {
      setMessage(
        "Error adding quiz: " + (error.response?.data?.error || error.message)
      );
    }
  };

  const navigateToDashboard = () => {
    const userRole = localStorage.getItem("role");
    if (userRole === "HR") {
      navigate("/hr-dashboard");
    } else if (userRole === "Instructor") {
      navigate("/instructor-dashboard");
    } else {
      navigate("/instructor-dashboard");
    }
  };

  return (
    <div className="quiz-container">
      <h2>Add New Quiz</h2>

      {isQuizSubmitted ? (
        <div>
          <h3>Thank you for submitting the quiz!</h3>
          <button className="submit-btn" onClick={navigateToDashboard}>
            Go to Dashboard
          </button>
        </div>
      ) : (
        <form className="quiz-form">
          <div className="form-group">
            <label>Course ID:</label>
            <input
              type="text"
              value={courseId}
              onChange={handleCourseIdChange}
              required
            />
          </div>
          {!isCourseValid && (
            <p className="error-message">
              Course ID does not exist. Please enter a valid course ID.
            </p>
          )}

          {isCourseValid && (
            <>
              <div className="form-group">
                <label>Number of Questions:</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  min="1"
                  required
                />
              </div>

              {currentQuestionIndex < numQuestions && (
                <>
                  <div className="form-group">
                    <label>Question:</label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      required
                    />
                  </div>
                  {options.map((option, index) => (
                    <div key={index} className="form-group">
                      <label>Option {String.fromCharCode(65 + index)}:</label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                        required
                      />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>Correct Option:</label>
                    <select
                      value={correctOption}
                      onChange={(e) => setCorrectOption(e.target.value)}
                      required
                    >
                      <option value="">Select Correct Option</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className="submit-btn"
                    onClick={handleSubmitQuestion}
                  >
                    Submit Question
                  </button>
                </>
              )}
            </>
          )}

          <div className="form-group">
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmitQuiz}
            >
              Submit Quiz
            </button>
          </div>

          {message && <p className="message">{message}</p>}
        </form>
      )}
    </div>
  );
};

export default AddQuiz;


