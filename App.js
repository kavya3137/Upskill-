import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Home from './components/Login/Login';
import InstructorLogin from './components/Instructor/InstructorLogin';
import InstructorDashboard from './components/Instructor/InstructorDashboard';
import SignUp from './components/signup/SignUp';
import ManagerLogin from './components/Manager/ManagerLogin';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import CreateNewCourse from "./components/Courses/CreateNewCourse";
import ViewCourses from "./components/ViewCourses";
// Correct named import for ManagerLogin
import ManageStudents from "./components/ManageStudents";
import LearnerLogin from './components/Learner/LearnerLogin';
import LearnerDashboard from './components/Learner/LearnerDashboard';
import HRLogin from './components/Hr/HRLogin';
import HRDashboard from './components/Hr/HRDashboard';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import GetCourses from './components/GetCourses';
import EditCourse from './components/EditCourse';
import Enrolled from "./components/Enrolled"; 
import TrackChanges from './components/TrackChanges';
import MyCourses from "./components/Learner/MyCourses";
import Learn from './components/Learn';
import Quiz from './components/Quiz';
import Completed from "./components/Completed";
import NotEnrolled from './components/Learner/NotEnrolled';
import AddQuiz from './components/AddQuiz';
import Progress from './components/Progress';
import EnrolledProgress from './components/EnrolledProgress';
import AssignLearner from './components/Manager/AssignLearner';
import ManagerTeam from './components/Manager/ManagerTeam';
import TeamProgress from './components/Manager/TeamProgress';
import FilterProgress from './components/Manager/filter';
import './App.css';
import TopPerformers from './components/Learner/TopPerfomer';

  function App() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Example GET request to fetch initial data from your backend
        const fetchData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:5000/api/data');
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch data');
            }
        };

        fetchData();
    }, []);
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/instructor/*" element={<InstructorLogin />} />
                <Route path="/instructor-dashboard" element={<InstructorDashboard />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/manager" element={<ManagerLogin />} />
                <Route path="/manager-dashboard" element={<ManagerDashboard />} />               
                <Route path="/learner" element={<LearnerLogin />} />
                <Route path="/learner-dashboard" element={<LearnerDashboard />} />
                <Route path="/hr/*" element={<HRLogin />} />
                <Route path="/hr-dashboard" element={<HRDashboard />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/create-new-course" element={<CreateNewCourse />} />
                <Route path="/view-courses" element={<ViewCourses />} />
                <Route path="/manage-students" element={<ManageStudents />} />
                <Route path="/get-courses" element={<GetCourses />} />
                <Route path="/enrolled" element={<Enrolled />} />
                <Route path="/courses/edit/:courseId" element={<EditCourse />} />
                <Route path="/track-changes" element={<TrackChanges />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/courses/:courseId/learn" element={<Learn />} />
                <Route path="/courses/:courseId/quiz" element={<Quiz />} />
                <Route path="/completed" element={<Completed />} />
                <Route path="/notenrolled" element={<NotEnrolled  />} />
                <Route path="/adds-quiz" element={<AddQuiz />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/enrolledprogress" element={<EnrolledProgress />} />
                <Route path="/assignlearner" element={<AssignLearner />} />
                <Route path="/manager-team" element={<ManagerTeam />} />
                <Route path="/team-progress" element={<TeamProgress />} />
                <Route path="/filter-progress" element={<FilterProgress />} />
                <Route path="/top-perfomer" element={<TopPerformers />} />

            </Routes>
        </Router>
    );
}

export default App;
