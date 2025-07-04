import React, { useState, useEffect } from 'react';
import './CreateNewCourse.module.css';
const CreateNewCourse = () => {
    const [formData, setFormData] = useState({
        course_id: '',
        course_title: '',
        description: '',
        video_link: '', // New field for video link
        pdf_link: '',   // New field for PDF link
        instructor_name: '',
        start_date: '',
        duration_weeks: 4,
        status: 'Draft',
        course_category: '',
    });

    const [instructors, setInstructors] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInstructors = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/instructors');
                const data = await response.json();
                if (response.ok) {
                    setInstructors(data.instructors);
                } else {
                    setError(data.error || 'Failed to fetch instructors');
                }
            } catch (error) {
                setError('Failed to fetch instructors');
            }
        };

        fetchInstructors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePublishNow = async () => {
        setFormData({ ...formData, status: 'Published' });
        await handleSubmit('Published');
    };

    const handleSaveAsDraft = async () => {
        setFormData({ ...formData, status: 'Draft' });
        await handleSubmit('Draft');
    };

    const handleSubmit = async (status) => {
        setMessage('');
        setError('');

        const dataToSubmit = {
            ...formData,
            status: status,
            duration_weeks: parseInt(formData.duration_weeks, 10),
        };

        try {
            const response = await fetch('http://localhost:5000/api/courses/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
                setFormData({
                    course_id: '',
                    course_title: '',
                    description: '',
                    video_link: '',
                    pdf_link: '',
                    instructor_name: '',
                    start_date: '',
                    duration_weeks: 4,
                    status: 'Draft',
                    course_category: '',
                });
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (error) {
            setError('Failed to submit the form');
        }
    };

    return (
        <div>
            <style>
                {`
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f9f9f9;
                        margin: 0;
                        padding: 0;
                    }

                    .create-course-container {
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    }

                    .create-course-container h1 {
                        font-size: 24px;
                        color: #333;
                        text-align: center;
                        margin-bottom: 20px;
                    }

                    .form-group {
                        display: flex;
                        align-items: center;
                        margin-bottom: 15px;
                    }

                    .form-group label {
                        width: 120px;
                        font-size: 16px;
                        color: #444;
                    }

                    .form-group input,
                    .form-group textarea,
                    .form-group select {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        font-size: 14px;
                    }

                    .form-group textarea {
                        resize: none;
                        height: 80px;
                    }

                    .button-group {
                        display: flex;
                        justify-content: flex-end;
                        gap: 10px;
                    }

                    .button-group button {
                        padding: 10px 15px;
                        font-size: 14px;
                        color: #ffffff;
                        background-color: #007bff;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                    }

                    .button-group button:disabled {
                        background-color: #ccc;
                        cursor: not-allowed;
                    }

                    .button-group button:hover {
                        background-color: #0056b3;
                    }

                    .message {
                        text-align: center;
                        margin-top: 10px;
                        color: green;
                    }

                    .error {
                        text-align: center;
                        margin-top: 10px;
                        color: red;
                    }
                `}
            </style>
            <div className="create-course-container">
                <h1>Create New Course</h1>
                <div className="form-group">
                    <label>Course ID:</label>
                    <input
                        type="text"
                        name="course_id"
                        value={formData.course_id}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Course Title:</label>
                    <input
                        type="text"
                        name="course_title"
                        value={formData.course_title}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="form-group">
                    <label>Video Link:</label>
                    <input
                        type="text"
                        name="video_link"
                        value={formData.video_link}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>PDF Link:</label>
                    <input
                        type="text"
                        name="pdf_link"
                        value={formData.pdf_link}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Instructor Name:</label>
                    <select
                        name="instructor_name"
                        value={formData.instructor_name}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Instructor</option>
                        {instructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                                {instructor.full_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Start Date:</label>
                    <input
                        type="date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="form-group">
                    <label>Duration (Weeks):</label>
                    <input
                        type="number"
                        name="duration_weeks"
                        value={formData.duration_weeks}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="button-group">
                    <button onClick={handleSaveAsDraft}>
                        Save as Draft
                    </button>
                    <button onClick={handlePublishNow}>
                        Publish Now
                    </button>
                </div>
                {message && <div className="message">{message}</div>}
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

export default CreateNewCourse;
