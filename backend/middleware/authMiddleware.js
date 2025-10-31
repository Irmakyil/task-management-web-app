const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User modelimizi import ediyoruz

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') 
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401); 
      throw new Error('Yetkili değil, token başarısız');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkili değil, token bulunamadı');
  }
};

module.exports = { protect };