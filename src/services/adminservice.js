const { Conflict } = require("../errors");

const prisma = require("../config/prisma");

const createJenisKejadianService = async (namaKerusakan, dinasId) => {
  const existing = await prisma.jenisKerusakan.findFirst({
    where: { jenis_kerusakan: namaKerusakan },
  });

  if (existing) throw new Conflict("Jenis kerusakan sudah ada");

  // pastikan dinasId valid
  const dinas = await prisma.dinas.findUnique({ where: { id: dinasId } });
  if (!dinas) throw new NotFound("Dinas tidak ditemukan");

  return await prisma.jenisKerusakan.create({
    data: {
      jenis_kerusakan: namaKerusakan,
      dinasId,
    },
  });
};

const getAllJenisKejadianService = async () => {
  const datas = await prisma.jenisKerusakan.findMany({
    include: {
      dinas: {
        select: {
          id: true,
          name: true, // ambil name dinas
        },
      },
    },
  });

  return datas;
};

const getTotalUserService = async (dinasName) => {
  const [countUser, countLaporan] = await Promise.all([
    prisma.user.count({
      where: { role: "USER" },
    }),

    prisma.laporan.count({
      where: {
        jenisKerusakan: {
          dinas: { name: dinasName },
        },
      },
    }),
  ]);

  return {
    countUser,
    countLaporan,
  };
};

module.exports = {
  createJenisKejadianService,
  getAllJenisKejadianService,
  getTotalUserService,
};
