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
    ["PLN", "DAMKAR", "POLDA"].includes(user.dinas.name)
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

const register = async (username, email, password, role) => {
  const checkEmail = await prisma.user.findUnique({ where: { email: email } });

  if (checkEmail)
    throw new Conflict("Email sudah terdaftar, harap pakai email lain ");

  const hashePassword = await hashedPassword(password);

  const userRegister = await prisma.user.create({
    data: {
      username,
      email,
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
