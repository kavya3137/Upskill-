import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ManagerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false); // Track OTP sending state
    const [otpSentEmail, setOtpSentEmail] = useState(''); // Store the email that OTP was sent to
    const navigate = useNavigate();

    // Handle Login (First Step: Email and Password)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // If login successful, send OTP
                localStorage.setItem('user_id', data.user_id);
                if (data.redirect === "/manager_dashboard") {
                    navigate('/manager-dashboard');
                }
                setOtpSentEmail(email);
                setIsOtpSent(true); // Switch to OTP input
            } else {
                setError(data.message || 'Invalid email or password!');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Handle OTP Verification (Second Step: OTP)
    const handleOtpVerification = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: otpSentEmail, otp }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store user ID in localStorage on successful login
                localStorage.setItem('user_id', data.user_id);

                if (data.redirect === "/manager_dashboard") {
                    navigate('/manager-dashboard');
                } else {
                    setError('You are not authorized to access the Manager dashboard.');
                }
            } else {
                setError(data.message || 'Invalid OTP!');
            }
        } catch (error) {
            setError('An error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // Remove user ID from localStorage on logout
        localStorage.removeItem('user_id');
        navigate('/login'); // Redirect to login page after logout
    };


    const styles = {
        container: {
            maxWidth: '400px',
            margin: '0 auto',
            padding: '2rem',
            borderRadius: '10px',
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
        },
        header: {
            fontSize: '2rem',
            marginBottom: '1rem',
            color: '#333',
        },
        formGroup: {
            marginBottom: '1rem',
            textAlign: 'left',
        },
        label: {
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 'bold',
            color: '#555',
        },
        input: {
            width: '100%',
            padding: '0.8rem',
            borderRadius: '5px',
            border: '1px solid #ccc',
            outline: 'none',
            fontSize: '1rem',
        },
        button: {
            width: '100%',
            padding: '0.8rem',
            marginTop: '1rem',
            borderRadius: '5px',
            border: 'none',
            background: 'linear-gradient(to right, #6a11cb, #2575fc)',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background 0.3s',
        },
        error: {
            color: 'red',
            fontWeight: 'bold',
            marginBottom: '1rem',
        },
        linkContainer: {
            marginTop: '1.5rem',
        },
        link: {
            fontSize: '0.9rem',
            textDecoration: 'none',
            color: '#6a11cb',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Manager Login</h1>

            {/* First Step: Email and Password */}
            {!isOtpSent ? (
                <form onSubmit={handleLogin}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="email">Email</label>
                        <input
                            style={styles.input}
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="password">Password</label>
                        <input
                            style={styles.input}
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            ) : (
                // Second Step: OTP Verification
                <form onSubmit={handleOtpVerification}>
                    <div style={styles.formGroup}>
                        <label style={styles.label} htmlFor="otp">OTP</label>
                        <input
                            style={styles.input}
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter OTP"
                            required
                        />
                    </div>
                    {error && <p style={styles.error}>{error}</p>}
                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                    >
                        {loading ? 'Verifying OTP...' : 'Verify OTP'}
                    </button>
                </form>
            )}

            <div style={styles.linkContainer}>
                <Link to="/forgot-password" style={styles.link}>
                    Forgot Password?
                </Link>
            </div>
        </div>
    );
};

export default ManagerLogin;
