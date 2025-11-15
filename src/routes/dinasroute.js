const expres = require("express");
const authenticateUser = require("../middlewares/auth");
const { authorizeRole } = require("../middlewares/authorizeRole");
const {
  updateStatusLaporanController,
  transferLaporanController,
  getLaporanDinasController,
  getDinasOptionsController,
} = require("../controllers/dinascontroller");
const { getTotalUserController } = require("../controllers/admincontroller");

const route = expres();

route.get(
  "/laporans/dinas",
  authenticateUser,
  authorizeRole(["DINAS"]),
  getLaporanDinasController
);

route.get(
  "/laporans/dinas/selesai",
  authenticateUser,
  authorizeRole(["DINAS", "ADMIN"]),
  (req, res) => {
    req.query.showDone = "true";
    return getLaporanDinasController(req, res);
  }
);

route.put(
  "/laporan/:laporanId/status",
  authenticateUser,
  authorizeRole(["DINAS"]),
  updateStatusLaporanController
);

route.get(
  "/countuser",
  authenticateUser,
  authorizeRole(["DINAS"]),
  getTotalUserController
);

route.post(
  "/laporan/:laporanId/transfer",
  authenticateUser,
  authorizeRole(["DINAS"]),
  transferLaporanController
);

route.get(
  "/dinas-options",
  authenticateUser,
  authorizeRole(["DINAS"]),
  getDinasOptionsController
);

module.exports = route;
