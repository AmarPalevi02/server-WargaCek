const { login } = require("../services/authservice");

const loginController = async (req, res) => {
   const { email, password } = req.body;

   try {
      const { token, user } = await login(email, password);
      res.status(200).json({
         status: "200",
         message: 'Login berhasil',
         user,
         token,
      });
   } catch (error) {
      res.status(401).json({
         message: error.message || 'Login gagal',
      });
   }
};

module.exports = {
   loginController
}