const jwt = require('jsonwebtoken');

const generateToken = (id, name, email, avatar) => { 
  return jwt.sign(
    { id, name, email, avatar }, 
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

module.exports = generateToken;