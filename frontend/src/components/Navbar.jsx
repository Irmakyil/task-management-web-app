import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { jwtDecode } from 'jwt-decode'; 
import ThemeToggle from './ThemeToggle'; 

import logoImage from '../assets/logo.png'; 

import bearAvatar from '../assets/bear.png';
import beeAvatar from '../assets/bee.png';
import foxAvatar from '../assets/fox.png';
import pandaAvatar from '../assets/panda.png';

const Logo = () => (
  <img src={logoImage} alt="TaskMintLogo" className={styles.logoImage} />
);
 
const avatarMap = {
  'Bear': bearAvatar,
  'Bee': beeAvatar,
  'Fox': foxAvatar,
  'Panda': pandaAvatar,
};

const getAvatarFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.avatar || 'Bear';
    } catch (error) {
      console.error("Failed to decode token:", error);
      return 'Bear';
    }
  }
  return 'Bear';
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [currentAvatarName, setCurrentAvatarName] = useState(getAvatarFromToken());
  const [profileAvatarSrc, setProfileAvatarSrc] = useState(avatarMap[currentAvatarName]);

  useEffect(() => {
    setProfileAvatarSrc(avatarMap[currentAvatarName]);
  }, [currentAvatarName]);

  // localStorage değişikliklerini dinleyen 'useEffect'
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setCurrentAvatarName(getAvatarFromToken());
      }
    };
    const handleAvatarUpdated = () => {
      setCurrentAvatarName(getAvatarFromToken());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatarUpdated', handleAvatarUpdated); 

    setCurrentAvatarName(getAvatarFromToken());

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatarUpdated', handleAvatarUpdated);
    };
  }, []); 

  const handleSignOut = () => {
    localStorage.removeItem('token'); 
    setCurrentAvatarName('Bear'); 
    setIsDropdownOpen(false); 
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Sol Taraf */}
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Logo />
            <span>TaskMint</span>
          </div>
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/analysis" 
            className={({ isActive }) => 
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            Analysis
          </NavLink>
        </div>

        {/* SAĞ TARAF */}
        <div className={styles.navRight}>
          
          {/* 1. Profil Dropdown  */}
          <div className={styles.profileDropdown}>
            <button 
              className={styles.profileButton} 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
            >
              {profileAvatarSrc ? (
                <img src={profileAvatarSrc} alt="Profile Avatar" className={styles.profileImage} />
              ) : (
                <div className={styles.profilePlaceholder}></div>
              )}
            </button>
            
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link 
                  to="/profile" 
                  className={styles.dropdownLink} 
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile Settings
                </Link>
                <button onClick={handleSignOut} className={styles.dropdownButton}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <ThemeToggle /> 

        </div>
      </div>
    </nav>
  );
};

export default Navbar;