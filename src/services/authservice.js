const prisma = require('../config/prisma')

const { generateToken } = require('../utils/jwt');
const { comparePassword, hashedPassword } = require('../utils/bcrypt');
const { Unauthorized, Conflict } = require('../errors');


const login = async (email, password, userCaptcha, sessionCaptcha) => {
   if (!userCaptcha || userCaptcha.toLowerCase() !== sessionCaptcha?.toLowerCase()) {
      throw new Unauthorized('Captcha tidak valid');
   }

   const user = await prisma.user.findUnique({
      where: { email }
   });

   if (!user) {
      throw new Unauthorized('Email atau Password salah')
   }

   const isMatch = await comparePassword(password, user.password)

   if (!isMatch) throw new Unauthorized('Email atau Password salah')

   const token = generateToken({ id: user.id, username: user.email })

   return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }
};


const loginAdminService = async (email, password) => {
   const user = await prisma.user.findUnique({
      where: { email }
   });

   if (!user) {
      throw new Unauthorized('Email atau Password salah')
   }

   const isMatch = await comparePassword(password, user.password)

   if (!isMatch) throw new Unauthorized('Email atau Password salah')

   const token = generateToken({ id: user.id, username: user.email, role: user.role })

   return { token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }
}


const register = async (username, email, password, role) => {
   const checkEmail = await prisma.user.findUnique({ where: { email: email } })

   if (checkEmail) throw new Conflict('Email sudah terdaftar, harap pakai email lain ')

   const hashePassword = await hashedPassword(password)

   const userRegister = await prisma.user.create({
      data: {
         username,
         email,
         password: hashePassword,
         role
      }
   })

   return userRegister
}

module.exports = {
   login,
   register,
   loginAdminService
}