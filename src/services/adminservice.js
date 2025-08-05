const { Conflict } = require('../errors')

const prisma = require('../config/prisma')

const createJenisKejadianService = async (namaKerusakan) => {
   const existing = await prisma.jenisKerusakan.findFirst({
      where: { jenis_kerusakan: namaKerusakan },
   })

   if (existing) throw new Conflict('Jenis kerusakan sudah ada')

   return await prisma.jenisKerusakan.create({
      data: {
         jenis_kerusakan: namaKerusakan
      }
   })
}

const getAllJenisKejadianService = async () => {
   const datas = await prisma.jenisKerusakan.findMany()

   return datas
}

module.exports = {
   createJenisKejadianService,
   getAllJenisKejadianService
}