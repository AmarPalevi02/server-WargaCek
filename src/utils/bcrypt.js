const bcrypt = require('bcrypt');

const ROUNDS = 10;

const hashedPassword = async (password) => {
   return await bcrypt.hash(password, ROUNDS);
};

const comparePassword = async (password, hash) => {
   return await bcrypt.compare(password, hash);
};

module.exports = {
   hashedPassword,
   comparePassword
};
