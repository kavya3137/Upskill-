import React, { useState, useEffect } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './SignUp.module.css';
import { useNavigate, useLocation } from 'react-router-dom';
import './Transitions.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [mobile, setMobile] = useState('');
    const [country, setCountry] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [userType, setUserType] = useState('Learner'); // Default to 'Learner'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [inProp, setInProp] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // UseEffect to track route changes and set userType accordingly
    useEffect(() => {
        const path = location.pathname.toLowerCase();
        if (path.includes('learner')) {
            setUserType('Learner');
        } else if (path.includes('manager')) {
            setUserType('Manager');
        } else if (path.includes('hr')) {
            setUserType('HR');
        } else if (path.includes('instructor')) {
            setUserType('Instructor');
        }
    }, [location]);

    const validatePassword = (pwd) => {
        const regex = /^.{8,}$/; // Matches any string with 8 or more characters
        return regex.test(pwd);
    };
    
    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (!validatePassword(password)) {
            setError(
                'Password must contain at least 8 characters, including one uppercase letter, one lowercase letter, one number, and one special character.'
            );
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!firstName || !lastName) {
            setError('First name and last name are required.');
            return;
        }

        setError('');
        try {
            const response = await fetch('http://127.0.0.1:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: `${firstName} ${lastName}`,
                    email,
                    password,
                    confirm_password: confirmPassword,
                    phone_number: mobile,
                    country,
                    role: userType, 
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess(result.message);
                setTimeout(() => {
                    navigate(`/${userType.toLowerCase()}`); // Navigate to lowercase role
                }, 2000);
            } else {
                setError(result.error || 'Unexpected error occurred.');
            }
        } catch (err) {
            setError('An error occurred while signing up. Please try again.');
        }
    };

    return (
        <CSSTransition in={inProp} timeout={700} classNames="fade" unmountOnExit>
            <div className={styles.container}>
                <div className={styles.formSection}>
                    <h1>UpSkill Vision - Your Learning Path</h1>
                    <p style={{ textAlign: 'center' }}>
                        Create a user account for further works or to access the courses
                    </p>
                    <div className={styles.tabContainer}>
                        <button
                            className={`${styles.tab} ${
                                userType === 'Learner' ? styles.active : ''
                            }`}
                            onClick={() => setUserType('Learner')}
                        >
                            LEARNER
                        </button>
                        <button
                            className={`${styles.tab} ${
                                userType === 'Manager' ? styles.active : ''
                            }`}
                            onClick={() => setUserType('Manager')}
                        >
                            MANAGER
                        </button>
                        <button
                            className={`${styles.tab} ${
                                userType === 'HR' ? styles.active : ''
                            }`}
                            onClick={() => setUserType('HR')}
                        >
                            HR ADMIN
                        </button>
                        <button
                            className={`${styles.tab} ${
                                userType === 'Instructor' ? styles.active : ''
                            }`}
                            onClick={() => setUserType('Instructor')}
                        >
                            INSTRUCTOR
                        </button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            required
                            className={styles.input}
                        />
                        <input
                            type="text"
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                            className={styles.input}
                        />
                        {error && <p className={styles.error}>{error}</p>}
                        {success && <p className={styles.success}>{success}</p>}
                        <button type="submit" className={styles.button}>
                            Get Started
                        </button>
                        <div className={styles.signinLink}>
                            Already a user? <a href={`/${userType.toLowerCase()}`}>Sign in</a>
                        </div>
                    </form>
                </div>
                <div className={styles.imageSection}></div>
            </div>
        </CSSTransition>
    );
};

export default SignUp;
