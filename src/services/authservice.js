const prisma = require("../config/prisma");

const { generateToken } = require("../utils/jwt");
const { comparePassword, hashedPassword } = require("../utils/bcrypt");
const { Unauthorized, Conflict } = require("../errors");

const login = async (email, password, userCaptcha, sessionCaptcha) => {
  if (
    !userCaptcha ||
    userCaptcha.toLowerCase() !== sessionCaptcha?.toLowerCase()
  ) {
    throw new Unauthorized("Captcha tidak valid");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || user.role !== "USER") {
    throw new Unauthorized("Email atau Password salah");
  }

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) throw new Unauthorized("Email atau Password salah");

  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  };
};

const loginAdminService = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { dinas: true },
  });

  if (!user) throw new Unauthorized("Email atau Password salah");

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) throw new Unauthorized("Email atau Password salah");

  // Validasi akses dashboard
  if (user.role === "ADMIN") {
    //Admin selalu boleh
  } else if (
    user.role === "DINAS" &&
    user.dinas &&
    ["PLN", "DAMKAR", "POLDA", "PU"].includes(user.dinas.name)
  ) {
    //USER dengan dinas tertentu boleh
  } else {
    throw new Unauthorized("Tidak punya akses ke dashboard");
  }

  // Buat token dengan informasi dinas
  const token = generateToken({
    id: user.id,
    username: user.username,
    role: user.role,
    dinasId: user.dinasId,
    dinasName: user.dinas?.name || null,
  });

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      dinasId: user.dinasId,
      dinasName: user.dinas?.name || null,
    },
  };
};

const register = async (username, email, no_telepon, password, role) => {
  const checkEmail = await prisma.user.findUnique({ where: { email: email } });

  if (checkEmail)
    throw new Conflict("Email sudah terdaftar, harap pakai email lain ");

  const hashePassword = await hashedPassword(password);

  const userRegister = await prisma.user.create({
    data: {
      username,
      email,
      no_telepon,
      password: hashePassword,
      role,
    },
  });

  return userRegister;
};

module.exports = {
  login,
  register,
  loginAdminService,
};





// services/authService.js
// const prisma = require("../config/prisma");
// const { generateToken } = require("../utils/jwt");
// const { comparePassword, hashedPassword } = require("../utils/bcrypt");
// const { Unauthorized, Conflict } = require("../errors");
// const { ALLOWED_DINAS_DASHBOARD } = require("../config/roleConstants");

// const login = async (email, password, userCaptcha, sessionCaptcha) => {
//   if (
//     !userCaptcha ||
//     userCaptcha.toLowerCase() !== sessionCaptcha?.toLowerCase()
//   ) {
//     throw new Unauthorized("Captcha tidak valid");
//   }

//   const user = await prisma.user.findUnique({
//     where: { email },
//     include: { dinas: true },
//   });

//   if (!user) {
//     throw new Unauthorized("Email atau Password salah");
//   }

//   const isMatch = await comparePassword(password, user.password);
//   if (!isMatch) throw new Unauthorized("Email atau Password salah");

//   const tokenPayload = {
//     id: user.id,
//     username: user.username,
//     role: user.role,
//     dinasId: user.dinasId,
//     dinasName: user.dinas?.name || null,
//   };

//   const token = generateToken(tokenPayload);

//   return {
//     token,
//     user: tokenPayload,
//   };
// };

// const loginAdminService = async (email, password) => {
//   const user = await prisma.user.findUnique({
//     where: { email },
//     include: { dinas: true },
//   });

//   if (!user) throw new Unauthorized("Email atau Password salah");

//   const isMatch = await comparePassword(password, user.password);
//   if (!isMatch) throw new Unauthorized("Email atau Password salah");

//   // Validasi akses dashboard berdasarkan role dan dinas name
//   if (user.role === "ADMIN") {
//     // Admin selalu boleh
//   } else if (user.role === "DINAS" && user.dinas) {
//     // Cek apakah dinas name termasuk yang diizinkan
//     if (!ALLOWED_DINAS_DASHBOARD.includes(user.dinas.name)) {
//       throw new Unauthorized("Tidak punya akses ke dashboard");
//     }
//   } else {
//     throw new Unauthorized("Tidak punya akses ke dashboard");
//   }

//   const tokenPayload = {
//     id: user.id,
//     username: user.username,
//     role: user.role,
//     dinasId: user.dinasId,
//     dinasName: user.dinas?.name || null,
//   };

//   const token = generateToken(tokenPayload);

//   return {
//     token,
//     user: tokenPayload,
//   };
// };

// const register = async (
//   username,
//   email,
//   no_telepon,
//   password,
//   role,
//   dinasId = null
// ) => {
//   const checkEmail = await prisma.user.findUnique({ where: { email: email } });

//   if (checkEmail) {
//     throw new Conflict("Email sudah terdaftar, harap pakai email lain");
//   }

//   const hashedPass = await hashedPassword(password);

//   const userData = {
//     username,
//     email,
//     no_telepon,
//     password: hashedPass,
//     role,
//   };

//   // Jika role DINAS, wajib punya dinasId
//   if (role === "DINAS") {
//     if (!dinasId) {
//       throw new Conflict("User dinas harus memiliki dinas");
//     }
//     userData.dinasId = dinasId;
//   }

//   const userRegister = await prisma.user.create({
//     data: userData,
//     include: { dinas: true },
//   });

//   return userRegister;
// };

// module.exports = {
//   login,
//   register,
//   loginAdminService,
// };
