const prisma = require("../config/prisma");
const { NotFoudn } = require("../errors");
const {DEFAULT_RADIUS} = require("../config/constans");

const createLaporanService = async ({
  tipe_kerusakan,
  deskripsi,
  location,
  longitude,
  latitude,
  foto_url,
  userId,
}) => {
  try {
    console.log("Received tipe_kerusakan:", tipe_kerusakan);
    const jenisKerusakan = await prisma.jenisKerusakan.findFirst({
      where: { jenis_kerusakan: tipe_kerusakan },
    });
    console.log("Found jenisKerusakan:", jenisKerusakan);

    if (!jenisKerusakan) {
      throw new Error("Jenis kerusakan tidak ditemukan");
    }

    const laporan = await prisma.laporan.create({
      data: {
        jenisKerusakan: { connect: { id: jenisKerusakan.id } },
        deskripsi,
        location,
        longitude,
        latitude,
        foto_url,
        User: { connect: { id: userId } },
      },
    });
    return laporan;
  } catch (error) {
    throw new NotFoudn("Gagal membuat laporan: " + error.message);
  }
};

const getLaporanService = async ({ userLat, userLng, radius = DEFAULT_RADIUS }) => {
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
          l.location,
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
    throw new NotFoudn("Gagal mengambil laporan: " + error.message);
  }
};

const histroyUserService = async (userId) => {
  try {
    const laporan = await prisma.laporan.findMany({
      where: { userId },
      include: {
        jenisKerusakan: { select: { jenis_kerusakan: true } },
        User: { select: { username: true } },
      },
      orderBy: {
        waktu_laporan: "desc",
      },
    });
    return laporan;
  } catch (error) {
    throw new NotFoudn("Gagal mengambil laporan: " + error.message);
  }
};

const deleteLaporanService = async (laporanId, userId) => {
  try {
    const laporan = await prisma.laporan.findFirst({
      where: {
        id: laporanId,
        userId: userId,
      },
    });

    if (!laporan) {
      throw new NotFoudn(
        "Laporan tidak ditemukan atau Anda tidak memiliki akses"
      );
    }

    await prisma.laporan.delete({
      where: { id: laporanId },
    });

    return { message: "Laporan berhasil dihapus" };
  } catch (error) {
    throw new NotFoudn("Gagal menghapus laporan: " + error.message);
  }
};

const voteLaporanService = async (laporanId, userId, type) => {
  try {
    // Pastikan laporan ada
    const laporan = await prisma.laporan.findUnique({
      where: { id: laporanId },
    });
    if (!laporan) throw new NotFoudn("Laporan tidak ditemukan");

    // Upsert vote (kalau ada → update, kalau belum → create)
    const vote = await prisma.vote.upsert({
      where: {
        userId_laporanId: { userId, laporanId },
      },
      update: { type },
      create: { userId, laporanId, type },
    });

    return vote;
  } catch (error) {
    console.log(error.message);
    throw new NotFoudn("Gagal memberikan vote: " + error.message);
  }
};

// Ambil laporan dengan jumlah like & dislike + userVote
const getLaporanWithVotesService = async ({
  userLat,
  userLng,
  radius = DEFAULT_RADIUS,
  userId,
}) => {
  try {
    let laporan;

    if (userLat && userLng) {
      const lat = parseFloat(userLat);
      const lng = parseFloat(userLng);
      const rad = parseFloat(radius);

      const latRange = rad / 111.045;
      const lngRange = rad / (111.045 * Math.cos((Math.PI / 180) * lat));

      laporan = await prisma.$queryRaw`
            SELECT 
               l.id,
               j.jenis_kerusakan AS tipe_kerusakan,
               l.deskripsi,
               l.location,
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

      const laporanIds = laporan.map((l) => l.id);

      // Ambil semua votes
      const votes = await prisma.vote.findMany({
        where: { laporanId: { in: laporanIds } },
      });

      laporan = laporan.map((l) => {
        const voteForLaporan = votes.filter((v) => v.laporanId === l.id);
        const likeCount = voteForLaporan.filter(
          (v) => v.type === "LIKE"
        ).length;
        const dislikeCount = voteForLaporan.filter(
          (v) => v.type === "DISLIKE"
        ).length;

        // Ambil vote user login
        const userVote =
          voteForLaporan.find((v) => v.userId === userId)?.type || null;

        return { ...l, likeCount, dislikeCount, userVote };
      });
    } else {
      laporan = await prisma.laporan.findMany({
        include: {
          jenisKerusakan: { select: { jenis_kerusakan: true } },
          User: { select: { username: true } },
          votes: true,
        },
      });

      laporan = laporan.map((l) => {
        const likeCount = l.votes.filter((v) => v.type === "LIKE").length;
        const dislikeCount = l.votes.filter((v) => v.type === "DISLIKE").length;

        const userVote = l.votes.find((v) => v.userId === userId)?.type || null;

        return {
          ...l,
          tipe_kerusakan: l.jenisKerusakan.jenis_kerusakan,
          likeCount,
          dislikeCount,
          userVote,
        };
      });
    }

    // Urutkan
    laporan.sort((a, b) => {
      if (a.likeCount !== b.likeCount) return b.likeCount - a.likeCount;
      if (a.dislikeCount !== b.dislikeCount)
        return a.dislikeCount - b.dislikeCount;
      return new Date(b.waktu_laporan) - new Date(a.waktu_laporan);
    });

    return laporan;
  } catch (error) {
    throw new NotFoudn("Gagal mengambil laporan dengan vote: " + error.message);
  }
};

module.exports = {
  createLaporanService,
  getLaporanService,
  histroyUserService,
  deleteLaporanService,
  voteLaporanService,
  getLaporanWithVotesService,
};
