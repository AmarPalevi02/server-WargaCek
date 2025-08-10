const expres = require("express")
const authenticateUser = require("../middlewares/auth")
const authorizeRole = require("../middlewares/authorizeRole")
const uploadMidleware = require("../middlewares/mullter")
const { createLaporanController, getLaporanController } = require("../controllers/usercontroller")
const route = expres()

route.post(
   '/unggahlaporan',
   authenticateUser,
   authorizeRole(["USER"]),
   uploadMidleware.single('foto'),
   createLaporanController
)

route.get(
   '/laporan',
   authenticateUser,
   getLaporanController
 );

module.exports = route