import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';

function TeamProgress() {
    const [managerId, setManagerId] = useState('');
    const [teamProgress, setTeamProgress] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const storedManagerId = localStorage.getItem('user_id');
        if (storedManagerId) {
            setManagerId(storedManagerId);
            fetchTeamProgress(storedManagerId);
        } else {
            setError('Manager ID is missing in localStorage');
        }
    }, []);

    const fetchTeamProgress = async (managerId) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5000/manager/team-course-progress/${managerId}`);
            setTeamProgress(response.data.team_progress);
            setError(null);
        } catch (err) {
            setError('Error fetching team progress data');
            setTeamProgress([]);
        }
    };

    const groupCoursesById = (courses) => {
        const grouped = {};
        courses.forEach(course => {
            if (!grouped[course.course_id] || grouped[course.course_id].attempt_time < course.attempt_time) {
                grouped[course.course_id] = course;
            }
        });
        return Object.values(grouped);
    };

    const generateScoreChartData = (course) => {
        const correctAnswers = course.correct_count;
        const incorrectAnswers = course.incorrect_count + course.unanswered_count;

        return {
            labels: ['Correct Answers', 'Incorrect/Unanswered'],
            datasets: [
                {
                    label: 'Score Distribution',
                    data: [correctAnswers, incorrectAnswers],
                    backgroundColor: ['#36A2EB', '#FFCE56'],
                    hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
                },
            ],
        };
    };

    const generateProgressBarStyle = (course) => {
        return {
            width: `${course.progress}%`,
            backgroundColor: course.progress === 100 ? '#4CAF50' : '#8BC34A',
            height: '20px',
            borderRadius: '5px',
            transition: 'width 0.3s ease-in-out',
        };
    };

    return (
        <div style={{ textAlign: 'center', margin: '20px' }}>
            <h1>Team Course Progress</h1>

            {error && <div style={{ color: 'red', marginBottom: '20px' }}>{error}</div>}

            <div
                style={{
                    maxHeight: '500px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '20px',
                    margin: '20px auto',
                    width: '80%',
                    backgroundColor: '#f9f9f9',
                }}
            >
                {teamProgress.length > 0 ? (
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                            gap: '20px',
                            justifyContent: 'center',
                        }}
                    >
                        {teamProgress.map((member) => {
                            const groupedCourses = groupCoursesById(member.courses_progress || []);

                            return (
                                <div
                                    key={member.user_id}
                                    style={{
                                        border: '1px solid #ddd',
                                        borderRadius: '10px',
                                        padding: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        maxWidth: '300px',
                                        backgroundColor: '#fff',
                                    }}
                                >
                                    <h2 style={{ fontSize: '16px', marginBottom: '10px' }}>
                                        {member.user_email}
                                    </h2>

                                    {groupedCourses.length > 0 ? (
                                        groupedCourses.map((course) => {
                                            const isCompleted = course.progress === 100;

                                            return (
                                                <div
                                                    key={course.course_id}
                                                    style={{
                                                        marginBottom: '20px',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <h3>{course.course_title}</h3>

                                                    <div
                                                        style={{
                                                            width: '100%',
                                                            backgroundColor: '#ddd',
                                                            borderRadius: '5px',
                                                            marginBottom: '10px',
                                                        }}
                                                    >
                                                        <div style={generateProgressBarStyle(course)} />
                                                    </div>
                                                    <p style={{ marginTop: '10px' }}>
                                                        Completion: <strong>{course.progress}%</strong>
                                                    </p>

                                                    {isCompleted && (
                                                        <div
                                                            style={{
                                                                animation: 'fade-in 1s',
                                                                marginTop: '10px',
                                                            }}
                                                        >
                                                            <span
                                                                style={{
                                                                    backgroundColor: '#4CAF50',
                                                                    color: '#fff',
                                                                    padding: '5px 10px',
                                                                    borderRadius: '5px',
                                                                    fontWeight: 'bold',
                                                                }}
                                                            >
                                                                Completed ✅
                                                            </span>
                                                        </div>
                                                    )}

                                                    {isCompleted && (
                                                        <>
                                                            <Pie
                                                                data={generateScoreChartData(course)}
                                                                options={{
                                                                    plugins: {
                                                                        legend: {
                                                                            position: 'bottom',
                                                                        },
                                                                        tooltip: {
                                                                            callbacks: {
                                                                                label: (tooltipItem) =>
                                                                                    `${tooltipItem.label}: ${tooltipItem.raw}`,
                                                                            },
                                                                        },
                                                                    },
                                                                    maintainAspectRatio: true,
                                                                }}
                                                                height={200}
                                                                width={200}
                                                            />
                                                            <p style={{ marginTop: '10px' }}>
                                                                Score: <strong>{course.score}</strong>
                                                            </p>
                                                            <div style={{ marginTop: '10px' }}>
                                                                <p><strong>Correct Answers:</strong> {course.correct_count}</p>
                                                                <p><strong>Incorrect Answers:</strong> {course.incorrect_count}</p>
                                                                <p><strong>Unanswered:</strong> {course.unanswered_count}</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p
                                            style={{
                                                marginTop: '10px',
                                                backgroundColor: '#f2f2f2',
                                                padding: '10px',
                                                borderRadius: '5px',
                                            }}
                                        >
                                            Not started any course yet
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    !error && <div>No team progress data available</div>
                )}
            </div>
        </div>
    );
}

export default TeamProgress;
