const prisma = require("../config/prisma");
const { NotFoudn, BadRequestError } = require("../errors");

const getLaporanPLNServices = async (dinasName) => {
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
      },
    },
    orderBy: { waktu_laporan: "desc" },
  });

  return laporans;
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
      },
    },
    orderBy: { waktu_laporan: "desc" },
  });

  return laporans;
};

module.exports = {
  getLaporanPLNServices,
  getLaporanPoldaServices,
  updateStatusLaporanServices,
};
