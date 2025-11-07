import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
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
      className={styles.toggleButton}
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Temaya göre ikonu değiştir */}
      {theme === 'dark' ? (
        <FaMoon className={styles.icon} />
      ) : (
        <FaSun className={styles.icon} />
      )}
    </button>
  );
};

export default ThemeToggle;