const express = require('express')
const { loginController } = require('../controllers/authcontroller')

const router = express()

router.post('/login', loginController)

module.exports = router