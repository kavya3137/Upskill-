import React, { useState } from 'react';
import axios from 'axios';
import styles from '../ForgotPassword/Forgetpassword.module.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [step, setStep] = useState('requestOTP'); // 'requestOTP' or 'resetPassword'
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/forgot-password', { email });
            setMessage(response.data.message);
            setStep('resetPassword');
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://127.0.0.1:5000/reset-password', {
                email,
                otp,
                new_password: newPassword,
                confirm_new_password: confirmNewPassword,
            });
            setMessage(response.data.message);
            setStep('requestOTP');
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.forgotPasswordContainer}>
            <h1 className={styles.header}>Forgot Password</h1>

            {step === 'requestOTP' && (
                <form onSubmit={handleRequestOTP}>
                    <label className={styles.label} htmlFor="email">
                        Email:
                    </label>
                    <input
                        className={styles.input}
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            )}

            {step === 'resetPassword' && (
                <form onSubmit={handleResetPassword}>
                    <label className={styles.label} htmlFor="otp">
                        OTP:
                    </label>
                    <input
                        className={styles.input}
                        type="text"
                        id="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <label className={styles.label} htmlFor="newPassword">
                        New Password:
                    </label>
                    <input
                        className={styles.input}
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                    <label className={styles.label} htmlFor="confirmNewPassword">
                        Confirm New Password:
                    </label>
                    <input
                        className={styles.input}
                        type="password"
                        id="confirmNewPassword"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                    <button
                        className={styles.button}
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            )}

            {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
            {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
        </div>
    );
};

export default ForgotPassword;
