const express = require('express')
const { loginController, registerController } = require('../controllers/authcontroller')

const router = express()

router.post('/login', loginController)
router.post('/register', registerController)

module.exports = router