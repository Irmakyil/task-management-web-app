import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthPage.module.css';
import { FaEye, FaEyeSlash, FaSun, FaMoon } from 'react-icons/fa'; 

import mintLeafLogo from '../assets/logo.png';

const AuthThemeToggle = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

return (
    <button
      className={styles.themeToggleButton}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Temaya göre ikonu değiştir */}
      {theme === 'dark' ? (
        <FaMoon className={styles.themeIcon} />
      ) : (
        <FaSun className={styles.themeIcon} />
      )}
    </button>
  );
};


const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  
  const navigate = useNavigate();

  // Token varsa Dashboard'a yönlendir
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (isRegister) {
      // --- KAYIT (SIGN UP) ---
      if (password !== confirmPassword) {
        setMessage({ type: 'error', content: 'Passwords do not match.' });
        return;
      }
      try {
        await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
        setMessage({ type: 'success', content: 'Registration successful! Please sign in.' });
        setIsRegister(false);
        setName(''); setEmail(''); setPassword(''); setConfirmPassword('');
      } catch (err) {
        setMessage({ type: 'error', content: err.response?.data?.message || 'Registration failed.' });
      }
    } else {
      // --- GİRİŞ (SIGN IN) ---
      try {
        const { data } = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        localStorage.setItem('token', data.token); 
        window.dispatchEvent(new CustomEvent('avatarUpdated')); 
        navigate('/dashboard');
      } catch (err) {
        setMessage({ type: 'error', content: err.response?.data?.message || 'Login failed.' });
      }
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Sol Panel (Marka) */}
      <div className={styles.leftPanel}>
        <img src={mintLeafLogo} alt="TaskMint Logo" className={styles.brandLogo} />
        <h1 className={styles.brandName}>TaskMint</h1>
        <p className={styles.tagline}>Manage Your Tasks. Achieve Your Goals.</p>
      </div>

      {/* Sağ Panel (Form) */}
      <div className={styles.rightPanel}>
        {/* TEMA BUTONU BURAYA EKLENDİ */}
        <div className={styles.themeToggleContainer}>
          <AuthThemeToggle />
        </div>
        
        <div className={styles.formWrapper}>
          {/* Sekmeler (Sign In / Sign Up) */}
          <div className={styles.tabContainer}>
            <button 
              className={`${styles.tabButton} ${!isRegister ? styles.active : ''}`}
              onClick={() => setIsRegister(false)}
            >
              Sign In
            </button>
            <button 
              className={`${styles.tabButton} ${isRegister ? styles.active : ''}`}
              onClick={() => setIsRegister(true)}
            >
              Sign Up
            </button>
          </div>

          <h2 className={styles.formTitle}>{isRegister ? 'Create Your Account' : 'Sign In'}</h2>
          <p className={styles.formSubtitle}>{isRegister ? 'Get started now.' : 'Welcome back!'}</p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  className={styles.formInput} 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={styles.formInput}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {isRegister && (
              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    className={styles.formInput} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    required
                  />
                  <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>
            )}

            {!isRegister && (
              <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>
            )}
            
            {message.content && (
              <p className={message.type === 'error' ? styles.messageError : styles.messageSuccess}>
                {message.content}
              </p>
            )}

            <button type="submit" className={styles.submitButton}>
              {isRegister ? 'Sign Up' : 'Sign In'}
            </button>
            
          </form>

          <div className={styles.toggleLinkContainer}>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsRegister(false)} className={styles.toggleLink}>
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsRegister(true)} className={styles.toggleLink}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;