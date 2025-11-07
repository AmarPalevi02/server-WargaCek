const {
  createLaporanService,
  getLaporanService,
  histroyUserService,
  deleteLaporanService,
  voteLaporanService,
  getLaporanWithVotesService,
  createKomentarService,
  getLaporanDetailService,
  deleteKomentarService,
} = require("../services/userservice");

const { DEFAULT_RADIUS } = require("../config/constans");

const createLaporanController = async (req, res) => {
  try {
    const { tipe_kerusakan, deskripsi, location, longitude, latitude } =
      req.body;
    const userId = req.user?.id;
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!tipe_kerusakan || !deskripsi || !longitude || !latitude || !userId) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const laporan = await createLaporanService({
      tipe_kerusakan,
      deskripsi,
      location,
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
      foto_url,
      userId,
    });

    res.status(201).json({
      status: "true",
      message: "Laporan berhasil dibuat",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      status: "false",
      error: error.message,
    });
  }
};

const getLaporanController = async (req, res) => {
  try {
    const { userLat, userLng, radius } = req.query;
    const laporan = await getLaporanService({
      userLat: userLat ? parseFloat(userLat) : undefined,
      userLng: userLng ? parseFloat(userLng) : undefined,
      radius: radius ? parseFloat(radius) : DEFAULT_RADIUS,
    });

    res.status(200).json({
      status: true,
      message: "Laporan berhasil diambil",
      data: laporan,
    });
  } catch (error) {
    console.error("Error in getLaporanController:", error.message);
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const histroyUserController = async (req, res) => {
  try {
    const { userId } = req.params;
    const laporan = await histroyUserService(userId);
    res.json({
      success: true,
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const deleteLaporanController = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const userId = req.user?.id;

    if (!laporanId || !userId) {
      return res.status(400).json({
        status: false,
        error: "laporanId atau userId tidak ditemukan",
      });
    }

    const result = await deleteLaporanService(laporanId, userId);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const voteLaporanController = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const { type } = req.body;
    const userId = req.user?.id;

    if (!laporanId || !userId || !type) {
      return res
        .status(400)
        .json({ status: false, error: "Data tidak lengkap" });
    }

    const vote = await voteLaporanService(laporanId, userId, type);

    res.status(200).json({
      status: true,
      message: "Vote berhasil",
      data: vote,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const createKomentarController = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const { konten } = req.body;
    const userId = req.user?.id;

    if (!laporanId || !konten || !userId) {
      return res.status(400).json({
        status: false,
        error: "Data tidak lengkap",
      });
    }

    const komentar = await createKomentarService(laporanId, userId, konten);

    res.status(201).json({
      status: true,
      message: "Komentar berhasil ditambahkan",
      data: komentar,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};


const deleteKomentarController = async (req, res) => {
  try {
    const { komentarId } = req.params;
    const userId = req.user?.id;

    if (!komentarId || !userId) {
      return res.status(400).json({
        status: false,
        error: "komentarId dan userId diperlukan",
      });
    }

    const result = await deleteKomentarService(komentarId, userId);

    res.status(200).json({
      status: true,
      message: result.message,
    });
  } catch (error) {
    if (error.message.includes("tidak memiliki akses")) {
      return res.status(403).json({
        status: false,
        error: error.message,
      });
    }
    
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const getLaporanWithVotesController = async (req, res) => {
  try {
    const { userLat, userLng, radius } = req.query;
    const userId = req.user?.id || null;

    const laporan = await getLaporanWithVotesService({
      userLat: userLat ? parseFloat(userLat) : undefined,
      userLng: userLng ? parseFloat(userLng) : undefined,
      radius: radius ? parseFloat(radius) : DEFAULT_RADIUS,
      userId,
    });

    res.status(200).json({
      status: true,
      message: "Laporan dengan vote berhasil diambil",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

const getLaporanDetailController = async (req, res) => {
  try {
    const { laporanId } = req.params;
    const userId = req.user?.id || null;

    if (!laporanId) {
      return res.status(400).json({
        status: false,
        error: "laporanId diperlukan",
      });
    }

    const laporan = await getLaporanDetailService(laporanId, userId);

    res.status(200).json({
      status: true,
      message: "Detail laporan berhasil diambil",
      data: laporan,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};

module.exports = {
  createLaporanController,
  getLaporanController,
  histroyUserController,
  deleteLaporanController,
  voteLaporanController,
  getLaporanWithVotesController,
  createKomentarController,
  getLaporanDetailController,
  deleteKomentarController,
};
