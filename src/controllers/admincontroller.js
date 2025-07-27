const {createJenisKejadianService} = require('../services/adminservice')


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
         statu: 'false',
         message: error.message || 'gagal membuat jenis kerusakan!',
      });
   }
}

module.exports = {
   createJenisKejadianController
}