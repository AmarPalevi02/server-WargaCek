const prisma = require("../config/prisma");
const { NotFoudn, BadRequestError } = require("../errors");

const getLaporanByDinasService = async (
  dinasName,
  page = 1,
  limit = 10,
  showDone = false
) => {
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 1. Cari dinas berdasarkan nama
    const dinas = await prisma.dinas.findUnique({
      where: {
        name: dinasName,
      },
    });

    if (!dinas) {
      return {
        data: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // 2. Tentukan status yang akan ditampilkan
    let statusFilter = ["PENDING", "VALIDATED", "IN_PROGRESS"];

    // Jika ingin menampilkan laporan DONE juga
    if (showDone) {
      statusFilter = ["DONE"];
    }

    // 3. CARI LAPORAN BERDASARKAN STATUS AKTIF DI DINAS INI
    const totalLaporans = await prisma.laporan.count({
      where: {
        statuses: {
          some: {
            dinasId: dinas.id,
            status: {
              in: statusFilter,
            },
          },
        },
      },
    });

    // 4. Jika tidak ada laporan, return empty
    if (totalLaporans === 0) {
      return {
        data: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limitNum,
          hasNext: false,
          hasPrev: false,
        },
      };
    }

    // 5. Ambil data laporan berdasarkan STATUS dengan vote count
    const laporans = await prisma.laporan.findMany({
      where: {
        statuses: {
          some: {
            dinasId: dinas.id,
            status: {
              in: statusFilter,
            },
          },
        },
      },
      include: {
        User: {
          select: { id: true, username: true, no_telepon: true },
        },
        jenisKerusakan: {
          include: {
            dinas: {
              select: { id: true, name: true },
            },
          },
        },
        statuses: {
          where: {
            dinasId: dinas.id,
            status: {
              in: statusFilter,
            },
          },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        votes: {
          select: {
            type: true,
          },
        },
        _count: {
          select: {
            komentar: true,
          },
        },
      },
      orderBy: { waktu_laporan: "desc" },
      skip: skip,
      take: limitNum,
    });

    // 6. Format response dengan vote count yang benar
    const formattedLaporans = laporans.map((laporan) => {
      const statusAktif = laporan.statuses[0];

      // Hitung jumlah like dan dislike
      const likes = laporan.votes.filter((vote) => vote.type === "LIKE").length;
      const dislikes = laporan.votes.filter(
        (vote) => vote.type === "DISLIKE"
      ).length;

      return {
        id: laporan.id,
        jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan,
        foto_url: laporan.foto_url,
        deskripsi: laporan.deskripsi,
        location: laporan.location,
        longitude: laporan.longitude,
        latitude: laporan.latitude,
        status: statusAktif ? statusAktif.status : "PENDING",
        statusUpdatedAt: statusAktif
          ? statusAktif.updatedAt
          : laporan.waktu_laporan,
        statuses: laporan.statuses,
        waktu_laporan: laporan.waktu_laporan,
        user: laporan.User,
        asalDinas: laporan.jenisKerusakan.dinas.name,
        dinasSekarang: dinasName,
        komentarCount: laporan._count.komentar,
        voteCount: {
          likes: likes,
          dislikes: dislikes,
        },
        ditransferDari: statusAktif?.transferredFrom || null,
        alasanTransfer: statusAktif?.transferReason || null,
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
  } catch (error) {
    throw new Error(`Gagal mengambil laporan: ${error.message}`);
  }
};


const updateStatusLaporanService = async ({
  laporanId,
  dinasId,
  status,
  userId,
}) => {
  try {
    // 1. Validasi status
    const validStatus = ["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"];
    if (!validStatus.includes(status)) {
      throw new Error(
        "Status tidak valid. Status harus: PENDING, VALIDATED, IN_PROGRESS, atau DONE"
      );
    }

    // 2. Cek apakah laporan exists dan ambil status aktif
    const laporan = await prisma.laporan.findUnique({
      where: { id: laporanId },
      include: {
        jenisKerusakan: {
          include: {
            dinas: true,
          },
        },
        // Cari status aktif (bukan DONE)
        statuses: {
          where: {
            status: {
              in: ["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"],
            },
          },
          include: {
            Dinas: true,
          },
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan");
    }

    // 3. CEK AUTHORIZATION - Cek apakah dinas user sama dengan dinas yang memiliki status AKTIF
    const statusAktif = laporan.statuses[0];

    if (!statusAktif) {
      throw new Error("Laporan tidak memiliki status aktif");
    }

    // Authorization: hanya dinas yang memiliki status aktif yang bisa update
    if (statusAktif.dinasId !== dinasId) {
      throw new Error(
        `Anda tidak memiliki akses untuk mengupdate laporan ini. Laporan ini sedang ditangani oleh dinas: ${statusAktif.Dinas.name}`
      );
    }

    // 4. Update status
    const laporanStatus = await prisma.laporanStatus.update({
      where: { id: statusAktif.id },
      data: {
        status: status,
        updatedAt: new Date(),
      },
      include: {
        Dinas: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      id: laporanStatus.id,
      laporanId: laporanStatus.laporanId,
      dinasId: laporanStatus.dinasId,
      status: laporanStatus.status,
      updatedAt: laporanStatus.updatedAt,
      dinas: laporanStatus.Dinas,
      laporan: {
        id: laporan.id,
        deskripsi: laporan.deskripsi,
        location: laporan.location,
        jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan,
      },
    };
  } catch (error) {
    throw new Error(`Gagal mengupdate status laporan: ${error.message}`);
  }
};

const transferLaporanService = async ({
  laporanId,
  currentDinasId,
  targetDinasId,
  reason,
}) => {
  console.log("SERVICE: Transfer laporan", {
    laporanId,
    currentDinasId,
    targetDinasId,
    reason,
  });

  try {
    // 1. Validasi laporan dan dinas saat ini - HANYA STATUS AKTIF
    const currentStatus = await prisma.laporanStatus.findFirst({
      where: {
        laporanId,
        dinasId: currentDinasId,
        status: {
          in: ["PENDING", "VALIDATED", "IN_PROGRESS"],
        },
      },
      include: {
        Laporan: {
          include: {
            jenisKerusakan: true,
          },
        },
        Dinas: true,
      },
    });

    if (!currentStatus) {
      throw new Error("Laporan tidak ditemukan atau tidak aktif di dinas Anda");
    }

    // 2. Validasi dinas target
    const targetDinas = await prisma.dinas.findUnique({
      where: { id: targetDinasId },
    });

    if (!targetDinas) {
      throw new Error("Dinas target tidak ditemukan");
    }

    // 3. Cek apakah sedang transfer ke dinas yang sama
    if (currentDinasId === targetDinasId) {
      throw new Error("Tidak dapat mentransfer laporan ke dinas yang sama");
    }

    // 4. Cek apakah laporan sudah AKTIF di dinas target
    const existingTargetStatus = await prisma.laporanStatus.findFirst({
      where: {
        laporanId,
        dinasId: targetDinasId,
        status: {
          in: ["PENDING", "VALIDATED", "IN_PROGRESS"], 
        },
      },
    });

    if (existingTargetStatus) {
      throw new Error("Laporan sudah aktif di dinas target");
    }

    // 5. Update status di dinas saat ini menjadi DONE dengan informasi transfer
    await prisma.laporanStatus.update({
      where: { id: currentStatus.id },
      data: {
        status: "DONE",
        transferredFrom: null, 
      },
    });

    // 6. Buat status baru di dinas target dengan status PENDING
    const newStatus = await prisma.laporanStatus.create({
      data: {
        laporanId,
        dinasId: targetDinasId,
        status: "PENDING", 
        transferredFrom: currentDinasId,
        transferReason: reason,
        updatedAt: new Date(),
      },
      include: {
        Dinas: {
          select: { id: true, name: true },
        },
        Laporan: {
          include: {
            User: {
              select: { username: true, email: true },
            },
            jenisKerusakan: {
              include: {
                dinas: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    console.log("Transfer berhasil:", {
      dariDinas: currentStatus.Dinas.name,
      keDinas: targetDinas.name,
      laporanId: laporanId,
    });

    return {
      id: newStatus.id,
      laporanId: newStatus.laporanId,
      dinasId: newStatus.dinasId,
      status: newStatus.status,
      transferredFrom: newStatus.transferredFrom,
      transferReason: newStatus.transferReason,
      updatedAt: newStatus.updatedAt,
      Dinas: newStatus.Dinas,
      Laporan: newStatus.Laporan,
    };
  } catch (error) {
    console.error("SERVICE ERROR:", error.message);
    throw new Error(`Gagal mentransfer laporan: ${error.message}`);
  }
};

const getAllDinasServices = async (excludeDinasId = null) => {
  try {
    const whereClause = excludeDinasId ? { id: { not: excludeDinasId } } : {};

    const dinas = await prisma.dinas.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return dinas;
  } catch (error) {
    throw new Error(`Gagal mengambil data dinas: ${error.message}`);
  }
};

module.exports = {
  getLaporanByDinasService,
  updateStatusLaporanService,
  transferLaporanService,
  getAllDinasServices,
};
