// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AuthForm.module.css'; // Aynı CSS'i kullanır

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });
      console.log('Kayıt başarılı:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Kayıt hatası:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    // 1. Ana container (İki sütunu kapsar)
    <div className={styles.authContainer}>

      {/* 2. Sol Taraf (Kapak) - Giriş sayfasıyla aynı */}
      <div className={styles.coverSide}>
        <div className={styles.coverContent}>
          <h1>Task Manager</h1>
          <p>Görevlerinizi kolayca yönetin ve takip edin.</p>
        </div>
      </div>

      {/* 3. Sağ Taraf (Form) */}
      <div className={styles.formSide}>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          <h2>Kayıt Ol</h2>
          
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="name">İsim</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Şifre</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Kayıt Ol
          </button>
          <p className={styles.switchLink}>
            Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
          </p>
        </form>
      </div>

    </div>
  );
};

export default RegisterPage;