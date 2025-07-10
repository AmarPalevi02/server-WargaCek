const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { comparePassword } = require('../utils/bcrypt');


const prisma = new PrismaClient();

const login = async (email, password) => {
   const user = await prisma.user.findUnique({
      where: { email },
   });

   if (!user) {
      throw new Error('User tidak ditemukan');
   }

   const isMatch = await comparePassword(password, user.password);
   if (!isMatch) {
      throw new Error('Password salah');
   }

   const token = generateToken({ id: user.id, username: user.username });

   return { token, user: { id: user.id, username: user.username } };
};

module.exports = {
   login
}