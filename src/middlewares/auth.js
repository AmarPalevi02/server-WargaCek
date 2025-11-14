// const jwt = require('jsonwebtoken');
// const { Unauthenticated } = require('../errors');
// require('dotenv').config();

// const authenticateUser = (req, res, next) => {
//    const authHeader = req.headers['authorization'];
//    const token = authHeader && authHeader.split(' ')[1];

//    if (!token) throw new Unauthenticated('Token tidak ditemukan');

//    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) throw new Unauthenticated('Token tidak valid');
//       req.user = user;
//       next();
//    });
// };

// module.exports = authenticateUser;





// middlewares/auth.js
const jwt = require("jsonwebtoken");
const { Unauthenticated } = require("../errors");
require("dotenv").config();

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) throw new Unauthenticated("Token tidak ditemukan");

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new Unauthenticated("Token tidak valid");

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      dinasId: decoded.dinasId,
      dinasName: decoded.dinasName, // Hanya dinasName
    };

    next();
  });
};

module.exports = authenticateUser;
