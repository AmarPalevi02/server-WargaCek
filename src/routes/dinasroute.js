const expres = require("express");
const authenticateUser = require("../middlewares/auth");
const authorizeRole = require("../middlewares/authorizeRole");
const {
  getLaporanPLNController,
  getLaporanPoldaController,
  updateStatusLaporanController,
} = require("../controllers/dinascontroller");

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

// ============ route POLDA ===================
route.get(
  "/laporan/dinas/polda",
  authenticateUser,
  authorizeRole(["POLDA"]),
  getLaporanPoldaController
);



module.exports = route;
