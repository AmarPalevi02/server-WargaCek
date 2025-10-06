const expres = require("express");
const authenticateUser = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorizeRole");
const {
  getLaporanPLNController,
  getLaporanPoldaController,
  updateStatusLaporanController,
} = require("../controllers/dinascontroller");
const { getTotalUserController } = require("../controllers/admincontroller");

const route = expres();

route.get(
  "/laporan/dinas/pln",
  authenticateUser,
  authorizeRole(["PLN"]),
  getLaporanPLNController
);

route.put(
  "/laporan/:laporanId/status",
  authenticateUser,
  authorizeRole(["PLN", "POLDA"]),
  updateStatusLaporanController
);

route.get(
  "/countuser",
  authenticateUser,
  authorizeRole(["PLN", "POLDA"]),
  getTotalUserController
);

// ============ route POLDA ===================
route.get(
  "/laporan/dinas/polda",
  authenticateUser,
  authorizeRole(["POLDA"]),
  getLaporanPoldaController
);

module.exports = route;
