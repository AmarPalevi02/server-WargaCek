const {
  getLaporanPLNServices,
  updateStatusLaporanServices,
} = require("../services/dinasservices");

const getLaporanPLNController = async (req, res) => {
  try {
    const { dinasName } = req.user;
    // Ambil page dan limit dari query parameters
    const { page = 1, limit = 10 } = req.query;

    if (!dinasName) {
      return res.status(400).json({ message: "User tidak terkait dinas" });
    }

    const result = await getLaporanPLNServices(dinasName, page, limit);

    res.status(200).json({
      status: "true",
      message: "Laporan berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      error: error.message,
    });
  }
};

const updateStatusLaporanController = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const { status } = req.body;
    const dinasId = req.user?.dinasId;

    if (!laporanId || !status) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const updatedStatus = await updateStatusLaporanServices({
      laporanId,
      dinasId,
      status,
    });

    res.status(200).json({
      status: true,
      message: "Status laporan berhasil diperbarui",
      data: updatedStatus,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      error: error.message,
    });
  }
};

// =========== controler POLDA ========================
const getLaporanPoldaController = async (req, res) => {
  try {
    const { dinasName } = req.user;
    // Ambil page dan limit dari query parameters
    const { page = 1, limit = 10 } = req.query;

    if (!dinasName) {
      return res.status(400).json({ message: "User tidak terkait dinas" });
    }

    const result = await getLaporanPLNServices(dinasName, page, limit);

    res.status(200).json({
      status: "true",
      message: "Laporan berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      error: error.message,
    });
  }
};

module.exports = {
  getLaporanPLNController,
  getLaporanPoldaController,
  updateStatusLaporanController,
};
