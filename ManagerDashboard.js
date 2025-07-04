import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Manager.module.css'; // Importing CSS Module

const ManagerDashboard = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log('Logout button clicked...');
        navigate('/'); // Navigate to the homepage or login
    };

    return (
        <div className={styles.dashboard}>
            <div className={styles.sidebar}>
                <div className={styles.logo}>UPSKILL</div>
                <a className={styles.link} href="#">Dashboard</a>
                <a className={styles.link} href="#">Team Performance</a>
                <a className={styles.link} href="#">User Management</a>
                <a className={styles.link} href="#">Notifications</a>
                <a className={styles.link} href="#">Settings</a>
                <a
                    className={styles.link}
                    href="#"
                    onClick={handleLogout}
                    style={{ cursor: 'pointer' }}
                >
                    Logout
                </a>
            </div>
            <div className={styles.mainContent}>
                <h2>Welcome Back, Manager</h2>
                <div className={styles.cards}>
                    <div className={styles.card}>
                        <h3>Team Performance</h3>
                        <button className={styles.button}>View &rarr;</button>
                    </div>
                    <div className={styles.card}>
                        <h3>add learner </h3>
                        <Link to="/assignlearner">
                            <button className={styles.button}>View &rarr;</button>
                        </Link>
                    </div>
                    <div className={styles.card}>
                        <h3>View Courses</h3>
                        <Link to="/view-courses">
                            <button className={styles.button}>View &rarr;</button>
                        </Link>
                    </div>
                    <div className={styles.card}>
                        <h3>TEAM ENROLLMENTS</h3>
                        <Link to="/manager-team">
                            <button className={styles.button}>View &rarr;</button>
                        </Link>
                    </div>
                    <div className={styles.card}>
                        <h3>Generate Reports</h3>
                        <button className={styles.button}>Generate &rarr;</button>
                    </div>
                    <div className={styles.card}>
                        <h3>Team Progress</h3>
                        <Link to="/team-progress">
                            <button className={styles.button}>View &rarr;</button>
                        </Link>
                    </div>
                    <div className={styles.card}>
                        <h3>Filter Progress</h3>
                        <Link to="/filter-progress">
                            <button className={styles.button}>View &rarr;</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
