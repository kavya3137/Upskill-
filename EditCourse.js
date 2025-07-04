import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../components/Courses/CreateNewCourse.module.css';

const EditCourse = () => {
    const { courseId } = useParams(); // Extracts courseId from the URL
    const navigate = useNavigate();

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch instructors
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

    // Fetch course details based on courseId (when editing)
    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/courses/${courseId}`);
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        course_id: data.course_id,
                        course_title: data.course_title,
                        description: data.description,
                        video_link: data.video_link || '', // Populate video link
                        pdf_link: data.pdf_link || '',     // Populate PDF link
                        instructor_name: data.instructor_name,
                        start_date: data.start_date,
                        duration_weeks: data.duration_weeks,
                        status: data.status,
                        course_category: data.course_category || '',
                    });
                } else {
                    setError(data.error || '');
                }
            } catch (error) {
                setError('');
            }
        };

        if (courseId) {
            fetchCourseDetails();
        }
    }, [courseId]);

    // Handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Validate form
    const validateForm = () => {
        if (!formData.course_title || !formData.description || !formData.instructor_name || !formData.start_date) {
            setError('All fields are required.');
            return false;
        }

        if (new Date(formData.start_date) < new Date()) {
            setError('Start date must be in the future.');
            return false;
        }

        if (formData.duration_weeks <= 0) {
            setError('Duration must be a positive number.');
            return false;
        }

        return true;
    };

    // Handle publish action
    const handlePublishNow = async () => {
        await handleSubmit('Published');
    };

    // Handle save as draft action
    const handleSaveAsDraft = async () => {
        await handleSubmit('Draft');
    };

    // Submit form to update the course
    const handleSubmit = async (status) => {
        if (!validateForm()) return;

        setMessage('');
        setError('');
        setIsSubmitting(true);

        const dataToSubmit = {
            ...formData,
            status: status,
            duration_weeks: parseInt(formData.duration_weeks, 10),
        };

        try {
            const response = await fetch('http://localhost:5000/api/courses/edit', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSubmit),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Course updated successfully');
                setTimeout(() => navigate('/view-courses'), 2000);
            } else {
                setError(data.error || 'Something went wrong');
            }
        } catch (error) {
            setError('Failed to submit the form');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Edit Course</h1>
            <div className={styles.formGroup}>
                <label>Course ID:</label>
                <input
                    type="text"
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Course Title:</label>
                <input
                    type="text"
                    name="course_title"
                    value={formData.course_title}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Description:</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                ></textarea>
            </div>
            <div className={styles.formGroup}>
                <label>Video Link:</label>
                <input
                    type="text"
                    name="video_link"
                    value={formData.video_link}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>PDF Link:</label>
                <input
                    type="text"
                    name="pdf_link"
                    value={formData.pdf_link}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Instructor Name:</label>
                <select
                    name="instructor_name"
                    value={formData.instructor_name}
                    onChange={handleInputChange}
                >
                    <option value="">Select Instructor</option>
                    {instructors.map((instructor) => (
                        <option key={instructor.id} value={instructor.full_name}>
                            {instructor.full_name}
                        </option>
                    ))}
                </select>
            </div>
            <div className={styles.formGroup}>
                <label>Start Date:</label>
                <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Duration (Weeks):</label>
                <input
                    type="number"
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={handleInputChange}
                />
            </div>
            <div className={styles.buttonGroup}>
                <button onClick={handleSaveAsDraft} disabled={isSubmitting}>
                    Save as Draft
                </button>
                <button onClick={handlePublishNow} disabled={isSubmitting}>
                    Publish Now
                </button>
            </div>
            {message && <div className={styles.message}>{message}</div>}
            {error && <div className={styles.error}>{error}</div>}
        </div>
    );
};

export default EditCourse;