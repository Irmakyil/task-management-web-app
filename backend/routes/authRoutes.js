const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword, 
  forgotPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// '/profile' rotası hem GET (bilgi alma) hem de PUT (güncelleme) işlemlerini destekler
router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Şifre güncelleme için yeni rota
router.put('/password', protect, updateUserPassword);

module.exports = router;