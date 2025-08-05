const { createJenisKejadianService, getAllJenisKejadianService } = require('../services/adminservice')


const createJenisKejadianController = async (req, res) => {
   const { namaKerusakan } = req.body

   try {
      const result = await createJenisKejadianService(namaKerusakan)

      res.status(201).json({
         status: "true",
         message: 'Berhasil membuat jenis kejadian',
         data: result
      })
   } catch (error) {
      res.status(401).json({
         status: 'false',
         message: error.message || 'gagal membuat jenis kerusakan!',
      });
   }
}

const getAllJenisKejadianController = async (req, res) => {
   try {
      const result = await getAllJenisKejadianService()

      res.status(200).json({
         status: "true",
         message: "Berhasil memuat",
         data: result
      })
   } catch (error) {
      res.status(401).json({
         status: 'false',
         message: error.message || 'gagal membuat jenis kerusakan!',
      });
   }
}

module.exports = {
   createJenisKejadianController,
   getAllJenisKejadianController
}