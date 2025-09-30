const { Unauthorized } = require("../errors");

const authorizeRole = (roles) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new Unauthorized("Unauthorized: User tidak ditemukan");
    }

    // cek apakah user.role atau user.dinasName ada di roles
    const allowed =
      (user.role && roles.includes(user.role)) ||
      (user.dinasName && roles.includes(user.dinasName));

    if (!allowed) {
      throw new Unauthorized("Forbidden: Akses ditolak");
    }

    next();
  };
};

module.exports = authorizeRole;
