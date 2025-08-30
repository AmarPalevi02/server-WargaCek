const { createLaporanService, getLaporanService } = require("../services/userservice");

const createLaporanController = async (req, res) => {
   try {
      const { tipe_kerusakan, deskripsi, location, longitude, latitude } = req.body;
      const userId = req.user?.id;
      const foto_url = req.file ? `/uploads/${req.file.filename}` : null;

      if (!tipe_kerusakan || !deskripsi || !longitude || !latitude || !userId) {
         return res.status(400).json({ error: 'Data tidak lengkap' });
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
         message: 'Laporan berhasil dibuat',
         data: laporan
      });
   } catch (error) {
      res.status(500).json({
         status: "false",
         error: error.message
      });
   }
};


const getLaporanController = async (req, res) => {
   try {
      const { userLat, userLng, radius } = req.query;
      const laporan = await getLaporanService({
         userLat: userLat ? parseFloat(userLat) : undefined,
         userLng: userLng ? parseFloat(userLng) : undefined,
         radius: radius ? parseFloat(radius) : 5,
      });

      res.status(200).json({
         status: true,
         message: 'Laporan berhasil diambil',
         data: laporan,
      });
   } catch (error) {
      console.error('Error in getLaporanController:', error.message);
      res.status(500).json({
         status: false,
         error: error.message,
      });
   }
};


module.exports = {
   createLaporanController,
   getLaporanController
}