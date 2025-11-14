const {
  transferLaporanServices,
  getAllDinasServices,
  getLaporanByDinasService,
  updateStatusLaporanService,
  transferLaporanService,
} = require("../services/dinasservices");


// const getLaporanDinasController = async (req, res) => {
//   try {
//     const { dinasName } = req.user;
//     const { page = 1, limit = 10 } = req.query;

//     if (!dinasName) {
//       return res.status(400).json({
//         status: false,
//         message: "User tidak terkait dengan dinas manapun",
//       });
//     }

//     const result = await getLaporanByDinasService(dinasName, page, limit);

//     res.status(200).json({
//       status: true,
//       message:
//         result.data.length > 0
//           ? `Laporan untuk dinas ${dinasName} berhasil diambil`
//           : `Tidak ada laporan untuk dinas ${dinasName}`,
//       data: result.data,
//       pagination: result.pagination,
//     });
//   } catch (error) {
//     if (error.message.includes("tidak ditemukan")) {
//       return res.status(404).json({
//         status: false,
//         error: error.message,
//       });
//     }

//     res.status(500).json({
//       status: false,
//       error: error.message,
//     });
//   }
// };





// controllers/laporanDinasController.js

const getLaporanDinasController = async (req, res) => {
  console.log("🎯 CONTROLLER: Get laporan dinas");
  
  try {
    const { dinasName } = req.user;
    const { page = 1, limit = 10, showDone = "false" } = req.query;

    console.log("Parameters:", { dinasName, page, limit, showDone });

    if (!dinasName) {
      return res.status(400).json({ 
        status: false,
        message: "User tidak terkait dengan dinas manapun" 
      });
    }

    // Convert string to boolean
    const includeDone = showDone === "true";

    const result = await getLaporanByDinasService(dinasName, page, limit, includeDone);

    res.status(200).json({
      status: true,
      message: `Laporan untuk dinas ${dinasName} berhasil diambil`,
      data: result.data,
      pagination: result.pagination,
      includeDone: includeDone
    });

  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error.message);
    res.status(500).json({
      status: false,
      error: error.message,
    });
  }
};





const updateStatusLaporanController = async (req, res) => {
  
  try {
    const { laporanId } = req.params;
    const { status } = req.body;
    const { id: userId, dinasId, dinasName } = req.user;

    console.log("Data received:", { 
      laporanIdFromParams: laporanId, 
      statusFromBody: status, 
      dinasId, 
      dinasName, 
      userId 
    });

    // Validasi input
    if (!laporanId) {
      return res.status(400).json({
        status: false,
        error: "laporanId harus disertakan dalam URL"
      });
    }

    if (!status) {
      return res.status(400).json({
        status: false,
        error: "Status harus disertakan dalam body request"
      });
    }

    if (!dinasId) {
      return res.status(400).json({
        status: false,
        error: "User tidak terkait dengan dinas manapun"
      });
    }

    // Update status
    const updatedStatus = await updateStatusLaporanService({
      laporanId,
      dinasId,
      status,
      userId
    });

    res.status(200).json({
      status: true,
      message: `Status laporan berhasil diubah menjadi ${status}`,
      data: updatedStatus
    });

  } catch (error) {
    
    // Handle specific errors
    if (error.message.includes("tidak memiliki akses")) {
      return res.status(403).json({
        status: false,
        error: error.message
      });
    }

    if (error.message.includes("tidak ditemukan")) {
      return res.status(404).json({
        status: false,
        error: error.message
      });
    }

    if (error.message.includes("Status tidak valid")) {
      return res.status(400).json({
        status: false,
        error: error.message
      });
    }

    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};


// const transferLaporanController = async (req, res) => {
//   try {
//     const { laporanId } = req.params;
//     const { targetDinasId, reason } = req.body;
//     const currentDinasId = req.user?.dinasId;

//     if (!laporanId || !targetDinasId || !reason) {
//       return res.status(400).json({
//         status: false,
//         error: "Data tidak lengkap. Diperlukan: targetDinasId dan reason",
//       });
//     }

//     const result = await transferLaporanServices({
//       laporanId,
//       currentDinasId,
//       targetDinasId,
//       reason,
//     });

//     res.status(200).json({
//       status: true,
//       message: "Laporan berhasil dialihkan ke dinas " + result.Dinas.name,
//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: false,
//       error: error.message,
//     });
//   }
// };

// const getDinasOptions = async (req, res) => {
//   try {
//     const dinas = await getAllDinasServices();

//     res.json({
//       status: "true",
//       message: "Data dinas berhasil diambil",
//       data: dinas,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "false",
//       error: error.message,
//     });
//   }
// };




// controllers/transferLaporanController.js

// Transfer laporan ke dinas lain
const transferLaporanController = async (req, res) => {
  console.log("🎯 CONTROLLER: Transfer laporan");
  
  try {
    const { laporanId } = req.params;
    const { targetDinasId, reason } = req.body;
    const { dinasId: currentDinasId, dinasName: currentDinasName } = req.user;

    console.log("Data transfer:", { laporanId, currentDinasId, targetDinasId, reason });

    // Validasi input
    if (!laporanId || !targetDinasId || !reason) {
      return res.status(400).json({
        status: false,
        error: "Data tidak lengkap. Diperlukan: targetDinasId dan reason"
      });
    }

    if (!currentDinasId) {
      return res.status(400).json({
        status: false,
        error: "User tidak terkait dengan dinas manapun"
      });
    }

    // Validasi reason tidak kosong
    if (reason.trim().length === 0) {
      return res.status(400).json({
        status: false,
        error: "Alasan transfer harus diisi"
      });
    }

    const result = await transferLaporanService({
      laporanId,
      currentDinasId,
      targetDinasId,
      reason: reason.trim()
    });

    res.status(200).json({
      status: true,
      message: `Laporan berhasil dialihkan dari ${currentDinasName} ke ${result.Dinas.name}`,
      data: {
        laporanId: result.laporanId,
        dariDinas: currentDinasName,
        keDinas: result.Dinas.name,
        alasan: result.transferReason,
        waktuTransfer: result.updatedAt
      }
    });

  } catch (error) {
    console.error("❌ CONTROLLER ERROR:", error.message);
    
    // Handle specific errors
    if (error.message.includes("tidak ditemukan")) {
      return res.status(404).json({
        status: false,
        error: error.message
      });
    }

    if (error.message.includes("sudah berada") || error.message.includes("dinas yang sama")) {
      return res.status(400).json({
        status: false,
        error: error.message
      });
    }

    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};

// Get daftar dinas untuk transfer (exclude dinas sendiri)
const getDinasOptionsController = async (req, res) => {
  try {
    const { dinasId: currentDinasId } = req.user;

    const dinas = await getAllDinasServices(currentDinasId);

    res.json({
      status: true,
      message: "Data dinas berhasil diambil",
      data: dinas,
    });
  } catch (error) {
    console.error("Error get dinas options:", error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};


module.exports = {
  getLaporanDinasController,
  updateStatusLaporanController,
  transferLaporanController,
  // getDinasOptions,
  getDinasOptionsController
};
