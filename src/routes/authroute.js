const express = require('express')
const { loginController, registerController } = require('../controllers/authcontroller')
const svgCaptcha = require('svg-captcha');

const router = express()

router.get('/captcha', (req, res) => {
   const captcha = svgCaptcha.create({
      noise: 2,
      ignoreChars: '0o1iIlL',
      color: true,
      background: '#ccf2ff'
   });

   req.session.captcha = captcha.text; 

   res.type('svg'); 
   res.status(200).send(captcha.data);
});


router.post('/login', loginController)
router.post('/register', registerController)

module.exports = router