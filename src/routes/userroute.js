const expres = require("express")
const authenticateUser = require("../middlewares/auth")
const authorizeRole = require("../middlewares/authorizeRole")
const uploadMidleware = require("../middlewares/mullter")
const { createLaporanController, getLaporanController, histroyUserController } = require("../controllers/usercontroller")
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

route.get(
   '/history/:userId',
   authenticateUser,
   authorizeRole(["USER"]),
   histroyUserController
)

module.exports = route