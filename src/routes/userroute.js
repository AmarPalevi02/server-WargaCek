const expres = require("express")
const authenticateUser = require("../middlewares/auth")
const authorizeRole = require("../middlewares/authorizeRole")
const uploadMidleware = require("../middlewares/mullter")
const {
   createLaporanController,
   getLaporanController,
   histroyUserController,
   deleteLaporanController,
   voteLaporanController,
   getLaporanWithVotesController
} = require("../controllers/usercontroller")

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
   '/laporan-vote',
   authenticateUser,
   getLaporanWithVotesController
);

route.get(
   '/history/:userId',
   authenticateUser,
   authorizeRole(["USER"]),
   histroyUserController
)

route.delete(
   '/delete-history/:laporanId',
   authenticateUser,
   authorizeRole(["USER"]),
   deleteLaporanController
)

route.post(
   "/laporan/:laporanId/vote",
   authenticateUser,
   authorizeRole(["USER"]),
   voteLaporanController
)

module.exports = route