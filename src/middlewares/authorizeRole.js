const { Unauthorized } = require("../errors");

const authorizeRole = (roles) => {
   return (req, res, next) => {
      const user = req.user;

      if (!user || !roles.includes(user.role)) {
         throw new Unauthorized('Forbidden: Akses ditolak')
      }

      next();
   };
};

module.exports = authorizeRole;
