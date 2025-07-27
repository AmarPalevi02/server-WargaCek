const express = require('express')
const authorizeRole = require('../middlewares/authorizeRole')
const authenticateUser = require('../middlewares/auth')
const { createJenisKejadianController } = require('../controllers/admincontroller')
const route = express()

route.post(
   '/createjeniskejadian',
   authenticateUser,
   authorizeRole(['ADMIN']),
   createJenisKejadianController,
)

module.exports = route