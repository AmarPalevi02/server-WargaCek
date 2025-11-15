const { Unauthorized } = require("../errors");
const { ROLE_PERMISSIONS, DINAS_CONFIG } = require("../config/roleConstants");


const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new Unauthorized("Unauthorized: User tidak ditemukan");
    }

    // Admin memiliki akses penuh ke semua endpoint
    if (user.role === "ADMIN") {
      return next();
    }

    // Cek apakah role user diizinkan
    if (allowedRoles.includes(user.role)) {
      return next();
    }

    throw new Unauthorized("Forbidden: Akses ditolak");
  };
};


const authorizeDinas = (allowedDinasNames = []) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new Unauthorized("Unauthorized: User tidak ditemukan");
    }

    // Admin bisa akses semua
    if (user.role === "ADMIN") {
      return next();
    }

    // Untuk user DINAS, cek dinas name
    if (user.role === "DINAS" && user.dinasName) {
      if (
        allowedDinasNames.length === 0 ||
        allowedDinasNames.includes(user.dinasName)
      ) {
        return next();
      }
    }

    throw new Unauthorized("Forbidden: Akses dinas ditolak");
  };
};


const authorizePermission = (permission) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new Unauthorized("Unauthorized: User tidak ditemukan");
    }

    const userPermissions = ROLE_PERMISSIONS[user.role];

    if (userPermissions && userPermissions[permission]) {
      return next();
    }

    throw new Unauthorized(
      `Forbidden: Tidak memiliki permission ${permission}`
    );
  };
};

module.exports = {
  authorizeRole,
  authorizeDinas,
  authorizePermission,
};
