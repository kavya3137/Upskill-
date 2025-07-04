import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <h1>UpSkill Vision - Your Learning Path</h1>
        <p>Login</p>
        <div className={styles.roleButtons}>
          <button onClick={() => navigate('/learner')}>LEARNER</button>
          <button onClick={() => navigate('/manager')}>MANAGER</button>
          <button onClick={() => navigate('/hr')}>HR ADMIN</button>
          <button onClick={() => navigate('/instructor')}>INSTRUCTOR</button>
        </div>
        <div className={styles.signin}>
          Don't have an account? <a href="/signup">Sign Up</a>
        </div>
      </div>
      <div className={styles.imageSection}>
        <img
          src="https://www.talintinternational.com/wp-content/uploads/2023/07/Employee-Skill-Training-Upskilling-Reskilling-and-Beyond-social-image-1.png"
          alt="Upskilling"
        />
      </div>
    </div>
  );
};

export default Home;
