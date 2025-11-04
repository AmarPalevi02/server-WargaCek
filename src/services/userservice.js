const prisma = require("../config/prisma");
const { NotFoudn } = require("../errors");
const { DEFAULT_RADIUS } = require("../config/constans");

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

    await prisma.laporanStatus.create({
      data: {
        laporanId: laporan.id,
        dinasId: jenisKerusakan.dinasId,
        status: "PENDING",
      },
    });

    return laporan;
  } catch (error) {
    throw new NotFoudn("Gagal membuat laporan: " + error.message);
  }
};

const getLaporanService = async ({
  userLat,
  userLng,
  radius = DEFAULT_RADIUS,
}) => {
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
        statuses: {
          include: {
            Dinas: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
        },
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
      include: {
        votes: true,
        statuses: true,
      },
    });

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan atau Anda tidak memiliki akses");
    }

    await prisma.$transaction(async (tx) => {
      await tx.vote.deleteMany({
        where: { laporanId: laporanId },
      });

      await tx.laporanStatus.deleteMany({
        where: { laporanId: laporanId },
      });

      await tx.laporan.delete({
        where: { id: laporanId },
      });
    });

    return { message: "Laporan berhasil dihapus" };
  } catch (error) {
    throw new NotFoudn("Gagal menghapus laporan: " + error.message);
  }
};

const voteLaporanService = async (laporanId, userId, type) => {
  try {
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

      // Ambil semua votes dan statuses
      const [votes, statuses] = await Promise.all([
        prisma.vote.findMany({
          where: { laporanId: { in: laporanIds } },
        }),
        prisma.laporanStatus.findMany({
          where: { laporanId: { in: laporanIds } },
          include: {
            Dinas: { select: { name: true } },
          },
          orderBy: { updatedAt: "desc" },
        }),
      ]);

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

        // Ambil status terbaru
        const latestStatus = statuses
          .filter((s) => s.laporanId === l.id)
          .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

        return {
          ...l,
          likeCount,
          dislikeCount,
          userVote,
          status: latestStatus?.status || "PENDING",
          statusUpdatedAt: latestStatus?.updatedAt,
          dinas: latestStatus?.Dinas?.name || null,
        };
      });
    } else {
      laporan = await prisma.laporan.findMany({
        include: {
          jenisKerusakan: { select: { jenis_kerusakan: true } },
          User: { select: { username: true } },
          votes: true,
          statuses: {
            include: {
              Dinas: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
            take: 1,
          },
        },
      });

      laporan = laporan.map((l) => {
        const likeCount = l.votes.filter((v) => v.type === "LIKE").length;
        const dislikeCount = l.votes.filter((v) => v.type === "DISLIKE").length;

        const userVote = l.votes.find((v) => v.userId === userId)?.type || null;

        const latestStatus = l.statuses[0];

        return {
          ...l,
          tipe_kerusakan: l.jenisKerusakan.jenis_kerusakan,
          likeCount,
          dislikeCount,
          userVote,
          status: latestStatus?.status || "PENDING",
          statusUpdatedAt: latestStatus?.updatedAt,
          dinas: latestStatus?.Dinas?.name || null,
        };
      });
    }

    // Fungsi untuk menghitung skor berdasarkan usia (1 MINGGU) dan vot
    const calculateScore = (laporanItem) => {
      const now = new Date();
      const laporanTime = new Date(laporanItem.waktu_laporan);
      const ageInMinutes = (now - laporanTime) / (1000 * 60 * 60);

      // Vote score (like meningkatkan, dislike menurunkan)
      const voteScore = laporanItem.likeCount - laporanItem.dislikeCount;

      // Laporan baru (< 1 MINGGU = 168 jam) mendapatkan bonus
      const isNew = ageInMinutes < 168;
      const ageBonus = isNew ? 1000 : 0;
      
      // Laporan lama (> 1 MINGGU) mendapatkan penalty berdasarkan usia
      const agePenalty = Math.max(0, (ageInMinutes - 168) * 0.5);

      return voteScore + ageBonus - agePenalty;
    };

    // Urutkan berdasarkan skor yang dihitung
    laporan.sort((a, b) => {
      const scoreA = calculateScore(a);
      const scoreB = calculateScore(b);

      // Prioritas utama: skor tertinggi di atas
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      // Jika skor sama, urutkan berdasarkan like count
      if (a.likeCount !== b.likeCount) {
        return b.likeCount - a.likeCount;
      }

      // Jika like count sama, urutkan berdasarkan waktu (terbaru di atas)
      return new Date(b.waktu_laporan) - new Date(a.waktu_laporan);
    });

    return laporan;
  } catch (error) {
    throw new Error("Gagal mengambil laporan dengan vote: " + error.message);
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
