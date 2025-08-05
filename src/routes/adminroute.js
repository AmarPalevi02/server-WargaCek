const express = require('express')
const authorizeRole = require('../middlewares/authorizeRole')
const authenticateUser = require('../middlewares/auth')
const { createJenisKejadianController, getAllJenisKejadianController } = require('../controllers/admincontroller')
const route = express()

route.post(
   '/create/jeniskejadian',
   authenticateUser,
   authorizeRole(['ADMIN']),
   createJenisKejadianController,
)

route.get(
   '/getAllKerusakan',
   authenticateUser,
   getAllJenisKejadianController,
)

module.exports = route