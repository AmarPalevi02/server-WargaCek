const prisma = require('../config/prisma')

const createLaporanService = async ({ tipe_kerusakan, deskripsi, longitude, latitude, foto_url, userId }) => {
   try {
      console.log('Received tipe_kerusakan:', tipe_kerusakan);
      const jenisKerusakan = await prisma.jenisKerusakan.findFirst({
         where: { jenis_kerusakan: tipe_kerusakan },
      });
      console.log('Found jenisKerusakan:', jenisKerusakan);

      if (!jenisKerusakan) {
         throw new Error('Jenis kerusakan tidak ditemukan');
      }

      const laporan = await prisma.laporan.create({
         data: {
            jenisKerusakan: { connect: { id: jenisKerusakan.id } },
            deskripsi,
            longitude,
            latitude,
            foto_url,
            User: { connect: { id: userId } },
         },
      });
      return laporan;
   } catch (error) {
      throw new Error('Gagal membuat laporan: ' + error.message);
   }
};

const getLaporanService = async ({ userLat, userLng, radius = 5}) => {
   try {
      let laporan;

      if (userLat && userLng) {
         const lat = parseFloat(userLat);
         const lng = parseFloat(userLng);
         const rad = parseFloat(radius);

         // 1 derajat lintang ≈ 111 km
         const latRange = rad / 111.045;
         const lngRange = rad / (111.045 * Math.cos((Math.PI / 180) * lat));

         laporan = await prisma.$queryRaw`
        SELECT 
          l.id,
          j.jenis_kerusakan AS tipe_kerusakan,
          l.deskripsi,
          l.longitude,
          l.latitude,
          l.foto_url,
          l.waktu_laporan,
          l.userId,
          u.username,
          (
            6371 * ACOS(
              COS(RADIANS(${lat})) * COS(RADIANS(l.latitude)) *
              COS(RADIANS(l.longitude) - RADIANS(${lng})) +
              SIN(RADIANS(${lat})) * SIN(RADIANS(l.latitude))
            )
          ) AS jarak
        FROM Laporan l
        JOIN JenisKerusakan j ON l.jenisKerusakanId = j.id
        JOIN User u ON l.userId = u.id
        WHERE l.latitude  BETWEEN (${lat} - ${latRange}) AND (${lat} + ${latRange})
          AND l.longitude BETWEEN (${lng} - ${lngRange}) AND (${lng} + ${lngRange})
        HAVING jarak < ${rad}
        ORDER BY jarak ASC;
      `;
      } else {
         // Kalau userLat & userLng tidak ada, ambil semua
         laporan = await prisma.laporan.findMany({
            include: {
               jenisKerusakan: { select: { jenis_kerusakan: true } },
               User: { select: { username: true } },
            },
         });
      }

      return laporan;
   } catch (error) {
      console.error("Error in getLaporanService:", error.message);
      throw new Error("Gagal mengambil laporan: " + error.message);
   }
};



module.exports = {
   createLaporanService,
   getLaporanService
}