const { login, register, loginAdminService } = require("../services/authservice");

const loginController = async (req, res) => {
   const { email, password, captcha } = req.body;

   if (!captcha || captcha.toLowerCase() !== req.session.captcha?.toLowerCase()) {
      return res.status(401).json({ message: 'Captcha tidak valid' });
   }

   try {
      const { token, user } = await login(email, password, captcha, req.session.captcha);
      req.session.captcha = null;


      res.status(200).json({
         status: "200",
         message: 'Login berhasil',
         user,
         token,
      });
   } catch (error) {
      res.status(401).json({
         statu: '401',
         message: error.message || 'Login gagal',
      });
   }
};

const loginAdminController = async (req, res) => {
   const { email, password } = req.body;

   try {
      const { token, user } = await loginAdminService(email, password);


      res.status(200).json({
         status: "200",
         message: 'Login berhasil',
         user,
         token,
      });

   } catch (error) {
      res.status(401).json({
         status: '401',
         message: error.message || 'Login gagal',
      });
   }
}

const registerController = async (req, res) => {
   const { username, email, no_telepon, password, role } = req.body

   try {
      const result = await register(username, email, no_telepon, password, role)
      res.status(201).json({
         status: "201",
         message: 'Success register',
         data: result
      })
   } catch (error) {
      res.status(401).json({
         status: '401',
         message: error.message || 'Login gagal',
      });
   }
}

module.exports = {
   loginController,
   registerController,
   loginAdminController
}