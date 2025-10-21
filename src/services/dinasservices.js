const prisma = require("../config/prisma");
const { NotFoudn, BadRequestError } = require("../errors");

const getLaporanPLNServices = async (dinasName, page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Hitung total data
  const totalLaporans = await prisma.laporan.count({
    where: {
      jenisKerusakan: {
        dinas: { name: dinasName },
      },
    },
  });

  // Ambil data dengan aggregation untuk vote count
  const laporans = await prisma.laporan.findMany({
    where: {
      jenisKerusakan: {
        dinas: { name: dinasName },
      },
    },
    include: {
      User: { select: { id: true, username: true, no_telepon: true } },
      jenisKerusakan: {
        select: {
          jenis_kerusakan: true,
          dinas: { select: { name: true } },
        },
      },
      statuses: {
        select: { status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        // Menggunakan _count untuk menghitung votes
        select: {
          votes: {
            where: { type: "LIKE" },
          },
        },
      },
    },
    orderBy: { waktu_laporan: "desc" },
    skip: skip,
    take: limitNum,
  });

  // Untuk mendapatkan dislike count
  const laporanIds = laporans.map((l) => l.id);

  const voteCounts = await prisma.vote.groupBy({
    by: ["laporanId", "type"],
    where: {
      laporanId: { in: laporanIds },
    },
    _count: {
      _all: true,
    },
  });

  // Format data dengan vote counts
  const formattedLaporans = laporans.map((laporan) => {
    const likeCount =
      voteCounts.find((v) => v.laporanId === laporan.id && v.type === "LIKE")
        ?._count?._all || 0;

    const dislikeCount =
      voteCounts.find((v) => v.laporanId === laporan.id && v.type === "DISLIKE")
        ?._count?._all || 0;

    return {
      ...laporan,
      voteCount: {
        likes: likeCount,
        dislikes: dislikeCount,
        total: likeCount + dislikeCount,
      },
    };
  });

  const totalPages = Math.ceil(totalLaporans / limitNum);

  return {
    data: formattedLaporans,
    pagination: {
      currentPage: pageNum,
      totalPages: totalPages,
      totalItems: totalLaporans,
      itemsPerPage: limitNum,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };
};

const updateStatusLaporanServices = async ({ laporanId, dinasId, status }) => {
  const laporan = await prisma.laporanStatus.findFirst({
    where: {
      laporanId,
      dinasId,
    },
  });

  if (!laporan) throw new NotFoudn("Laporan tidak ditemukan");

  if (!["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"].includes(status)) {
    throw new BadRequestError("Status tidak valid");
  }

  const updatedStatus = await prisma.laporanStatus.update({
    where: { id: laporan.id },
    data: { status },
  });

  return updatedStatus;
};

// ================ DINSA POLDA =====================
const getLaporanPoldaServices = async () => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Hitung total data
  const totalLaporans = await prisma.laporan.count({
    where: {
      jenisKerusakan: {
        dinas: { name: dinasName },
      },
    },
  });

  // Ambil data dengan aggregation untuk vote count
  const laporans = await prisma.laporan.findMany({
    where: {
      jenisKerusakan: {
        dinas: { name: dinasName },
      },
    },
    include: {
      User: { select: { id: true, username: true } },
      jenisKerusakan: {
        select: {
          jenis_kerusakan: true,
          dinas: { select: { name: true } },
        },
      },
      statuses: {
        select: { status: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      },
      _count: {
        // Menggunakan _count untuk menghitung votes
        select: {
          votes: {
            where: { type: "LIKE" },
          },
        },
      },
    },
    orderBy: { waktu_laporan: "desc" },
    skip: skip,
    take: limitNum,
  });

  // Untuk mendapatkan dislike count
  const laporanIds = laporans.map((l) => l.id);

  const voteCounts = await prisma.vote.groupBy({
    by: ["laporanId", "type"],
    where: {
      laporanId: { in: laporanIds },
    },
    _count: {
      _all: true,
    },
  });

  // Format data dengan vote counts
  const formattedLaporans = laporans.map((laporan) => {
    const likeCount =
      voteCounts.find((v) => v.laporanId === laporan.id && v.type === "LIKE")
        ?._count?._all || 0;

    const dislikeCount =
      voteCounts.find((v) => v.laporanId === laporan.id && v.type === "DISLIKE")
        ?._count?._all || 0;

    return {
      ...laporan,
      voteCount: {
        likes: likeCount,
        dislikes: dislikeCount,
        total: likeCount + dislikeCount,
      },
    };
  });

  const totalPages = Math.ceil(totalLaporans / limitNum);

  return {
    data: formattedLaporans,
    pagination: {
      currentPage: pageNum,
      totalPages: totalPages,
      totalItems: totalLaporans,
      itemsPerPage: limitNum,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  };
};

module.exports = {
  getLaporanPLNServices,
  getLaporanPoldaServices,
  updateStatusLaporanServices,
};
