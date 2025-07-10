const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '1d';

if (!JWT_SECRET) {
   throw new Error('JWT_SECRET is not defined in environment variables!');
}

const generateToken = (payload) => {
   return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
   return jwt.verify(token, JWT_SECRET);
};

module.exports = {
   generateToken,
   verifyToken
};
