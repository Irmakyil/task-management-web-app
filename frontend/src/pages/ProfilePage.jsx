import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProfilePage.module.css'; // Stil dosyasını import et
import { useNavigate } from 'react-router-dom';
// import MainLayout from '../components/MainLayout'; // <-- 1. BU SATIRI SİLİN

// Düzeltilmiş import yolları (src/assets/ klasöründen)
import bearAvatar from '../assets/bear.png';
import beeAvatar from '../assets/bee.png';
import foxAvatar from '../assets/fox.png';
import pandaAvatar from '../assets/panda.png';

const avatars = [
  { name: 'Bear', src: bearAvatar },
  { name: 'Bee', src: beeAvatar },
  { name: 'Fox', src: foxAvatar },
  { name: 'Panda', src: pandaAvatar },
];

const ProfilePage = () => {
  // Profil Formu State'leri
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('Bear');
  
  // Şifre Formu State'leri
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Yüklenme ve Mesaj State'leri
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  
  const navigate = useNavigate();

  // Sayfa Yüklendiğinde: Backend'den mevcut profil verisini çek
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5000/api/auth/profile', config);
        
        setName(data.name);
        setEmail(data.email);
        setSelectedAvatar(data.avatar || 'Bear');
        setLoading(false);
      } catch (error) {
        console.error('Could not fetch profile', error);
        setProfileMessage(error.response?.data?.message || 'Error fetching profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Profil Güncelleme (İsim / Avatar) Fonksiyonu
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage(''); // Önceki mesajı temizle
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(
        'http://localhost:5000/api/auth/profile', 
        { name, avatar: selectedAvatar }, 
        config
      );
      
      localStorage.setItem('token', data.token); // Token güncellenmişse sakla
      window.dispatchEvent(new CustomEvent('avatarUpdated')); // Navbar'daki avatarı güncellemek için event
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      setProfileMessage(error.response?.data?.message || 'Error updating profile.');
    }
  };

  // Şifre Değiştirme Fonksiyonu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(''); // Önceki mesajı temizle

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        'http://localhost:5000/api/auth/password', 
        { currentPassword, newPassword }, 
        config
      );
      
      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || 'Error changing password.');
    }
  };

  // Yüklenme ekranı
  if (loading) {
    // 2. <MainLayout> sarmalayıcısını buradan kaldırın
    return <div className={styles.loadingContainer}>Loading profile...</div>;
  }

  // --- JSX (HTML) Kısmı ---
  // 3. <MainLayout> sarmalayıcısını buradan kaldırın
  return (
    <div className={styles.profileContainer}>
      
      {/* --- YENİ BAŞLIK YAPISI --- */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSubtitle}>Update your name and choose a profile image.</p>
      </div>
      {/* --- BAŞLIK BİTİŞİ --- */}
      
      {/* 1. Kısım: Profil Ayarları (İsim/Avatar) */}
      <div className={styles.formSection}>
        
        <form onSubmit={handleProfileUpdate} className={styles.innerForm}>
          {/* Avatar Seçimi */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Profile Image</label>
            <p className={styles.description}>Choose one of the images below.</p>
            <div className={styles.avatarList}>
              {avatars.map((avatar) => (
                <div 
                  key={avatar.name} 
                  className={`${styles.avatarItem} ${selectedAvatar === avatar.name ? styles.avatarSelected : ''}`}
                  onClick={() => setSelectedAvatar(avatar.name)}
                >
                  <img 
                    src={avatar.src} 
                    alt={avatar.name} 
                    className={styles.avatarImage} 
                  />
                  <span>{avatar.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* İsim */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Name</label>
            <input 
              type="text" 
              id="name" 
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>
          
          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email (cannot be changed)</label>
            <input 
              type="email" 
              id="email" 
              className={`${styles.formInput} ${styles.disabledInput}`}
              value={email}
              disabled // Email değiştirilemez
            />
          </div>
          
          {/* Profil Mesajı (Başarı/Hata) */}
          {profileMessage && (
            <p className={profileMessage.includes('successfully') ? styles.messageSuccess : styles.messageError}>
              {profileMessage}
            </p>
          )}
          
          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* 2. Kısım: Şifre Değiştirme */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Change Password</h2>
        <p className={styles.sectionSubtitle}>Update your password to keep your account secure.</p>
        
        <form onSubmit={handleChangePassword} className={styles.innerForm}>
          <div className={styles.passwordGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>Current Password</label>
              <input 
                type="password" 
                id="currentPassword"
                className={styles.formInput}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
              <input 
                type="password" 
                id="newPassword"
                className={styles.formInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword"
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          
          {/* Şifre Mesajı (Başarı/Hata) */}
          {passwordMessage && (
            <p className={passwordMessage.includes('successfully') ? styles.messageSuccess : styles.messageError}>
              {passwordMessage}
            </p>
          )}

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              Change Password
            </button>
          </div>
        </form>
      </div>
      
    </div>
  );
};

export default ProfilePage;