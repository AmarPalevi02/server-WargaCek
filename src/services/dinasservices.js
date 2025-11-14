const prisma = require("../config/prisma");
const { NotFoudn, BadRequestError } = require("../errors");

// getLAporanByDInasService main
// const getLaporanByDinasService = async (dinasName, page = 1, limit = 10) => {
//   try {
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // 1. Cari dinas berdasarkan nama
//     const dinas = await prisma.dinas.findUnique({
//       where: { 
//         name: dinasName 
//       }
//     });

//     if (!dinas) {
//       return {
//         data: [],
//         pagination: {
//           currentPage: pageNum,
//           totalPages: 0,
//           totalItems: 0,
//           itemsPerPage: limitNum,
//           hasNext: false,
//           hasPrev: false,
//         },
//       };
//     }

//     // 2. Cari jenis kerusakan yang terkait dengan dinas ini
//     const jenisKerusakanList = await prisma.jenisKerusakan.findMany({
//       where: { 
//         dinasId: dinas.id 
//       },
//       select: { id: true }
//     });

//     const jenisKerusakanIds = jenisKerusakanList.map(jk => jk.id);

//     // 3. Jika tidak ada jenis kerusakan, return empty
//     if (jenisKerusakanIds.length === 0) {
//       return {
//         data: [],
//         pagination: {
//           currentPage: pageNum,
//           totalPages: 0,
//           totalItems: 0,
//           itemsPerPage: limitNum,
//           hasNext: false,
//           hasPrev: false,
//         },
//       };
//     }

//     // 4. Hitung total laporan
//     const totalLaporans = await prisma.laporan.count({
//       where: {
//         jenisKerusakanId: {
//           in: jenisKerusakanIds
//         }
//       }
//     });

//     // 5. Jika tidak ada laporan, return empty
//     if (totalLaporans === 0) {
//       return {
//         data: [],
//         pagination: {
//           currentPage: pageNum,
//           totalPages: 0,
//           totalItems: 0,
//           itemsPerPage: limitNum,
//           hasNext: false,
//           hasPrev: false,
//         },
//       };
//     }

//     // 6. Ambil data laporan
//     const laporans = await prisma.laporan.findMany({
//        where: {
//         jenisKerusakanId: {
//           in: jenisKerusakanIds
//         }
//       },
//       select: {
//         id: true,
//         foto_url: true,
//         deskripsi: true,
//         location: true,
//         longitude: true,    
//         latitude: true,     
//         waktu_laporan: true,
//         statuses: true,
//         User: {
//           select: { id: true, username: true, no_telepon: true }
//         },
//         jenisKerusakan: {
//           select: { 
//             id: true, 
//             jenis_kerusakan: true,
//             dinas: { select: { name: true } }
//           }
//         },
//         votes: {
//           select: {
//             type: true 
//           }
//         }
//       },
//       orderBy: { waktu_laporan: 'desc' },
//       skip: skip,
//       take: limitNum
//     });

//     const formattedLaporans = laporans.map(laporan => {
//       // Hitung jumlah like dan dislike berdasarkan schema VoteType
//       const likes = laporan.votes.filter(vote => vote.type === 'LIKE').length;
//       const dislikes = laporan.votes.filter(vote => vote.type === 'DISLIKE').length;

//       return {
//         id: laporan.id,
//         jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan,
//         foto_url: laporan.foto_url,
//         deskripsi: laporan.deskripsi,
//         location: laporan.location,
//         longitude: laporan.longitude,  
//         latitude: laporan.latitude,    
//         waktu_laporan: laporan.waktu_laporan,
//         user: laporan.User,
//         dinas: laporan.jenisKerusakan.dinas.name,
//         statuses: laporan.statuses,
//         voteCount: {
//           likes: likes.toString(),
//           dislikes: dislikes.toString()
//         }
//       };
//     });

//     const totalPages = Math.ceil(totalLaporans / limitNum);

//     return {
//       data: formattedLaporans,
//       pagination: {
//         currentPage: pageNum,
//         totalPages: totalPages,
//         totalItems: totalLaporans,
//         itemsPerPage: limitNum,
//         hasNext: pageNum < totalPages,
//         hasPrev: pageNum > 1,
//       },
//     };

//   } catch (error) {
//     throw new Error(`Gagal mengambil laporan: ${error.message}`);
//   }
// };




// services/laporanDinasService.js - PERBAIKAN BESAR
// const getLaporanByDinasService = async (dinasName, page = 1, limit = 10) => {
//   try {
//     const pageNum = parseInt(page);
//     const limitNum = parseInt(limit);
//     const skip = (pageNum - 1) * limitNum;

//     // 1. Cari dinas berdasarkan nama
//     const dinas = await prisma.dinas.findUnique({
//       where: { 
//         name: dinasName 
//       }
//     });

//     if (!dinas) {
//       return {
//         data: [],
//         pagination: {
//           currentPage: pageNum,
//           totalPages: 0,
//           totalItems: 0,
//           itemsPerPage: limitNum,
//           hasNext: false,
//           hasPrev: false,
//         },
//       };
//     }

//     // 2. CARI LAPORAN BERDASARKAN STATUS AKTIF DI DINAS INI
//     const totalLaporans = await prisma.laporan.count({
//       where: {
//         statuses: {
//           some: {
//             dinasId: dinas.id,
//             status: {
//               in: ["PENDING", "VALIDATED", "IN_PROGRESS"]
//             }
//           }
//         }
//       }
//     });

//     // 3. Jika tidak ada laporan aktif, return empty
//     if (totalLaporans === 0) {
//       return {
//         data: [],
//         pagination: {
//           currentPage: pageNum,
//           totalPages: 0,
//           totalItems: 0,
//           itemsPerPage: limitNum,
//           hasNext: false,
//           hasPrev: false,
//         },
//       };
//     }

//     // 4. Ambil data laporan berdasarkan STATUS AKTIF dengan vote count
//     const laporans = await prisma.laporan.findMany({
//       where: {
//         statuses: {
//           some: {
//             dinasId: dinas.id,
//             status: {
//               in: ["PENDING", "VALIDATED", "IN_PROGRESS", ]
//             }
//           }
//         }
//       },
//       include: {
//         User: {
//           select: { id: true, username: true, no_telepon: true }
//         },
//         jenisKerusakan: {
//           include: {
//             dinas: {
//               select: { id: true, name: true }
//             }
//           }
//         },
//         statuses: {
//           where: {
//             dinasId: dinas.id,
//             status: {
//               in: ["PENDING", "VALIDATED", "IN_PROGRESS",]
//             }
//           },
//           orderBy: { updatedAt: 'desc' },
//           take: 1
//         },
//         votes: {
//           select: {
//             type: true
//           }
//         },
//         _count: {
//           select: {
//             komentar: true,
//           }
//         }
//       },
//       orderBy: { waktu_laporan: 'desc' },
//       skip: skip,
//       take: limitNum
//     });

//     // 5. Format response dengan vote count yang benar
//     const formattedLaporans = laporans.map(laporan => {
//       const statusAktif = laporan.statuses[0];
      
//       // Hitung jumlah like dan dislike
//       const likes = laporan.votes.filter(vote => vote.type === 'LIKE').length;
//       const dislikes = laporan.votes.filter(vote => vote.type === 'DISLIKE').length;
      
//       return {
//         id: laporan.id,
//         jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan,
//         foto_url: laporan.foto_url,
//         deskripsi: laporan.deskripsi,
//         location: laporan.location,
//         longitude: laporan.longitude,
//         latitude: laporan.latitude,
//         status: statusAktif ? statusAktif.status : 'PENDING',
//         statusUpdatedAt: statusAktif ? statusAktif.updatedAt : laporan.waktu_laporan,
//         statuses: laporan.statuses,
//         waktu_laporan: laporan.waktu_laporan,
//         user: laporan.User,
//         asalDinas: laporan.jenisKerusakan.dinas.name,
//         dinasSekarang: dinasName,
//         komentarCount: laporan._count.komentar,
//         // Vote count yang benar
//         voteCount: {
//           likes: likes.toString(),
//           dislikes: dislikes.toString()
//         },
//         ditransferDari: statusAktif?.transferredFrom || null,
//         alasanTransfer: statusAktif?.transferReason || null
//       };
//     });

//     const totalPages = Math.ceil(totalLaporans / limitNum);

//     return {
//       data: formattedLaporans,
//       pagination: {
//         currentPage: pageNum,
//         totalPages: totalPages,
//         totalItems: totalLaporans,
//         itemsPerPage: limitNum,
//         hasNext: pageNum < totalPages,
//         hasPrev: pageNum > 1,
//       },
//     };

//   } catch (error) {
//     throw new Error(`Gagal mengambil laporan: ${error.message}`);
//   }
// };



const getLaporanByDinasService = async (dinasName, page = 1, limit = 10, showDone = false) => {
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // 1. Cari dinas berdasarkan nama
    const dinas = await prisma.dinas.findUnique({
      where: { 
        name: dinasName 
      }
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
      statusFilter = ["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"];
    }

    // 3. CARI LAPORAN BERDASARKAN STATUS AKTIF DI DINAS INI
    const totalLaporans = await prisma.laporan.count({
      where: {
        statuses: {
          some: {
            dinasId: dinas.id,
            status: {
              in: statusFilter
            }
          }
        }
      }
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
              in: statusFilter
            }
          }
        }
      },
      include: {
        User: {
          select: { id: true, username: true, no_telepon: true }
        },
        jenisKerusakan: {
          include: {
            dinas: {
              select: { id: true, name: true }
            }
          }
        },
        statuses: {
          where: {
            dinasId: dinas.id,
            status: {
              in: statusFilter
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        },
        votes: {
          select: {
            type: true
          }
        },
        _count: {
          select: {
            komentar: true,
          }
        }
      },
      orderBy: { waktu_laporan: 'desc' },
      skip: skip,
      take: limitNum
    });

    // 6. Format response dengan vote count yang benar
    const formattedLaporans = laporans.map(laporan => {
      const statusAktif = laporan.statuses[0];
      
      // Hitung jumlah like dan dislike
      const likes = laporan.votes.filter(vote => vote.type === 'LIKE').length;
      const dislikes = laporan.votes.filter(vote => vote.type === 'DISLIKE').length;
      
      return {
        id: laporan.id,
        jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan,
        foto_url: laporan.foto_url,
        deskripsi: laporan.deskripsi,
        location: laporan.location,
        longitude: laporan.longitude,
        latitude: laporan.latitude,
        status: statusAktif ? statusAktif.status : 'PENDING',
        statusUpdatedAt: statusAktif ? statusAktif.updatedAt : laporan.waktu_laporan,
        statuses: laporan.statuses,
        waktu_laporan: laporan.waktu_laporan,
        user: laporan.User,
        asalDinas: laporan.jenisKerusakan.dinas.name,
        dinasSekarang: dinasName,
        komentarCount: laporan._count.komentar,
        voteCount: {
          likes: likes,
          dislikes: dislikes
        },
        ditransferDari: statusAktif?.transferredFrom || null,
        alasanTransfer: statusAktif?.transferReason || null
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




// UPDATE MAIN
// const updateStatusLaporanService = async ({ laporanId, dinasId, status, userId }) => {
//   try {
//     // 1. Validasi status
//     const validStatus = ["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"];
//     if (!validStatus.includes(status)) {
//       throw new Error("Status tidak valid. Status harus: PENDING, VALIDATED, IN_PROGRESS, atau DONE");
//     }

//     // 2. Cek apakah laporan exists dan authorization
//     const laporan = await prisma.laporan.findUnique({
//       where: { id: laporanId },
//       include: {
//         jenisKerusakan: {
//           include: {
//             dinas: true
//           }
//         }
//       }
//     });

//     if (!laporan) {
//       throw new Error("Laporan tidak ditemukan");
//     }

//     // 3. Cek authorization
//     if (laporan.jenisKerusakan.dinasId !== dinasId) {
//       throw new Error("Anda tidak memiliki akses untuk mengupdate laporan ini. Laporan ini terkait dengan dinas: " + laporan.jenisKerusakan.dinas.name);
//     }

//     // 4. GUNAKAN UPSERT - Update jika ada, create jika belum ada
//     // Cari unique identifier untuk LaporanStatus
//     const existingStatus = await prisma.laporanStatus.findFirst({
//       where: {
//         laporanId: laporanId,
//         dinasId: dinasId,
//         transferredFrom: null 
//       },
//       select: { id: true }
//     });

//     let laporanStatus;

//     if (existingStatus) {
//       // UPDATE existing record
//       laporanStatus = await prisma.laporanStatus.update({
//         where: { id: existingStatus.id },
//         data: { 
//           status: status,
//           updatedAt: new Date()
//         },
//       });
//     } else {
//       // CREATE new record
//       laporanStatus = await prisma.laporanStatus.create({
//         data: {
//           laporanId,
//           dinasId,
//           status: status,
//         },
//       });
//     }

//     return {
//       id: laporanStatus.id,
//       laporanId: laporanStatus.laporanId,
//       dinasId: laporanStatus.dinasId,
//       status: laporanStatus.status,
//       updatedAt: laporanStatus.updatedAt,
//       laporan: {
//         id: laporan.id,
//         deskripsi: laporan.deskripsi,
//         location: laporan.location,
//         jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan
//       }
//     };

//   } catch (error) {
//     throw new Error(`Gagal mengupdate status laporan: ${error.message}`);
//   }
// };



// Service untuk mengalihkan laporan ke dinas lain
// const transferLaporanServices = async ({ 
//   laporanId, 
//   currentDinasId, 
//   targetDinasId, 
//   reason 
// }) => {
//   // Validasi laporan dan dinas saat ini
//   const currentStatus = await prisma.laporanStatus.findFirst({
//     where: {
//       laporanId,
//       dinasId: currentDinasId
//     },
//     include: {
//       Laporan: true
//     }
//   });

//   if (!currentStatus) {
//     throw new NotFoudn("Laporan tidak ditemukan atau tidak berada di dinas Anda");
//   }

//   // Validasi dinas target
//   const targetDinas = await prisma.dinas.findUnique({
//     where: { id: targetDinasId }
//   });

//   if (!targetDinas) {
//     throw new NotFoudn("Dinas target tidak ditemukan");
//   }

//   // Cek apakah laporan sudah ada di dinas target
//   const existingTargetStatus = await prisma.laporanStatus.findFirst({
//     where: {
//       laporanId,
//       dinasId: targetDinasId
//     }
//   });

//   if (existingTargetStatus) {
//     throw new BadRequestError("Laporan sudah berada di dinas target");
//   }

//   // Update status di dinas saat ini menjadi "transferred"
//   await prisma.laporanStatus.update({
//     where: { id: currentStatus.id },
//     data: { 
//       status: "DONE",
//       transferredFrom: null // Reset karena ini adalah dinas asal
//     }
//   });

//   // Buat status baru di dinas target
//   const newStatus = await prisma.laporanStatus.create({
//     data: {
//       laporanId,
//       dinasId: targetDinasId,
//       status: "PENDING",
//       transferredFrom: currentDinasId,
//       transferReason: reason
//     },
//     include: {
//       Dinas: {
//         select: { name: true }
//       },
//       Laporan: {
//         include: {
//           User: {
//             select: { username: true, email: true }
//           },
//           jenisKerusakan: true
//         }
//       }
//     }
//   });

//   return newStatus;
// };


// const getAllDinasServices = async () => {
//   try {
//     const dinas = await prisma.dinas.findMany({
//       select: {
//         id: true,
//         name: true,
//       },
//       orderBy: {
//         name: 'asc'
//       }
//     });

//     return dinas;
//   } catch (error) {
//     throw new Error(`Gagal mengambil data dinas: ${error.message}`);
//   }
// }






// services/transferLaporanService.js



const updateStatusLaporanService = async ({ laporanId, dinasId, status, userId }) => {
  try {
    // 1. Validasi status
    const validStatus = ["PENDING", "VALIDATED", "IN_PROGRESS", "DONE"];
    if (!validStatus.includes(status)) {
      throw new Error("Status tidak valid. Status harus: PENDING, VALIDATED, IN_PROGRESS, atau DONE");
    }

    // 2. Cek apakah laporan exists
    const laporan = await prisma.laporan.findUnique({
      where: { id: laporanId },
      include: {
        jenisKerusakan: {
          include: {
            dinas: true
          }
        },
        // TAMBAH INI: Cek status aktif
        statuses: {
          where: {
            status: {
              in: ["PENDING", "VALIDATED", "IN_PROGRESS"]
            }
          },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!laporan) {
      throw new Error("Laporan tidak ditemukan");
    }

    // 3. CEK AUTHORIZATION BERDASARKAN STATUS AKTIF - PERUBAHAN PENTING
    const statusAktif = laporan.statuses[0];
    
    if (!statusAktif) {
      throw new Error("Laporan tidak memiliki status aktif");
    }

    // Cek apakah dinas user sama dengan dinas yang memiliki status aktif
    if (statusAktif.dinasId !== dinasId) {
      throw new Error(`Anda tidak memiliki akses untuk mengupdate laporan ini. Laporan ini sedang ditangani oleh dinas: ${statusAktif.dinas?.name || 'Unknown'}`);
    }

    // 4. Update status
    const laporanStatus = await prisma.laporanStatus.update({
      where: { id: statusAktif.id },
      data: { 
        status: status,
        updatedAt: new Date()
      },
    });

    return {
      id: laporanStatus.id,
      laporanId: laporanStatus.laporanId,
      dinasId: laporanStatus.dinasId,
      status: laporanStatus.status,
      updatedAt: laporanStatus.updatedAt,
      laporan: {
        id: laporan.id,
        deskripsi: laporan.deskripsi,
        location: laporan.location,
        jenisKerusakan: laporan.jenisKerusakan.jenis_kerusakan
      }
    };

  } catch (error) {
    throw new Error(`Gagal mengupdate status laporan: ${error.message}`);
  }
};





// TRANSFER MAIN
// const transferLaporanService = async ({ 
//   laporanId, 
//   currentDinasId, 
//   targetDinasId, 
//   reason 
// }) => {
//   console.log("🔄 SERVICE: Transfer laporan", { laporanId, currentDinasId, targetDinasId, reason });

//   try {
//     // 1. Validasi laporan dan dinas saat ini
//     const currentStatus = await prisma.laporanStatus.findFirst({
//       where: {
//         laporanId,
//         dinasId: currentDinasId
//       },
//       include: {
//         Laporan: {
//           include: {
//             jenisKerusakan: true
//           }
//         }
//       }
//     });

//     if (!currentStatus) {
//       throw new Error("Laporan tidak ditemukan atau tidak berada di dinas Anda");
//     }

//     // 2. Validasi dinas target
//     const targetDinas = await prisma.dinas.findUnique({
//       where: { id: targetDinasId }
//     });

//     if (!targetDinas) {
//       throw new Error("Dinas target tidak ditemukan");
//     }

//     // 3. Cek apakah sedang transfer ke dinas yang sama
//     if (currentDinasId === targetDinasId) {
//       throw new Error("Tidak dapat mentransfer laporan ke dinas yang sama");
//     }

//     // 4. Cek apakah laporan sudah ada di dinas target
//     const existingTargetStatus = await prisma.laporanStatus.findFirst({
//       where: {
//         laporanId,
//         dinasId: targetDinasId
//       }
//     });

//     if (existingTargetStatus) {
//       throw new Error("Laporan sudah berada di dinas target");
//     }

//     // 5. Update status di dinas saat ini - TANDAI SEBAGAI DITRANSFER
//     await prisma.laporanStatus.update({
//       where: { id: currentStatus.id },
//       data: { 
//         status: "DONE", // atau bisa juga "TRANSFERRED" jika mau buat status khusus
//         transferredFrom: null // Reset karena ini adalah dinas asal
//       }
//     });

//     // 6. Buat status baru di dinas target
//     const newStatus = await prisma.laporanStatus.create({
//       data: {
//         laporanId,
//         dinasId: targetDinasId,
//         status: "PENDING", // Status awal di dinas baru
//         transferredFrom: currentDinasId,
//         transferReason: reason
//       },
//       include: {
//         Dinas: {
//           select: { name: true }
//         },
//         Laporan: {
//           include: {
//             User: {
//               select: { username: true, email: true }
//             },
//             jenisKerusakan: true
//           }
//         }
//       }
//     });

//     console.log("Transfer berhasil:", {
//       dariDinas: currentDinasId,
//       keDinas: targetDinasId,
//       laporanId: laporanId
//     });

//     return newStatus;

//   } catch (error) {
//     console.error("❌ SERVICE ERROR:", error.message);
//     throw new Error(`Gagal mentransfer laporan: ${error.message}`);
//   }
// };





const transferLaporanService = async ({ 
  laporanId, 
  currentDinasId, 
  targetDinasId, 
  reason 
}) => {
  console.log("🔄 SERVICE: Transfer laporan", { laporanId, currentDinasId, targetDinasId, reason });

  try {
    // 1. Validasi laporan dan dinas saat ini - HANYA STATUS AKTIF
    const currentStatus = await prisma.laporanStatus.findFirst({
      where: {
        laporanId,
        dinasId: currentDinasId,
        status: {
          in: ["PENDING", "VALIDATED", "IN_PROGRESS"] // Hanya laporan aktif yang bisa ditransfer
        }
      },
      include: {
        Laporan: {
          include: {
            jenisKerusakan: true
          }
        }
      }
    });

    if (!currentStatus) {
      throw new Error("Laporan tidak ditemukan atau tidak aktif di dinas Anda");
    }

    // 2. Validasi dinas target
    const targetDinas = await prisma.dinas.findUnique({
      where: { id: targetDinasId }
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
          in: ["PENDING", "VALIDATED", "IN_PROGRESS"] // Cek status aktif saja
        }
      }
    });

    if (existingTargetStatus) {
      throw new Error("Laporan sudah aktif di dinas target");
    }

    // 5. Update status di dinas saat ini menjadi DONE
    await prisma.laporanStatus.update({
      where: { id: currentStatus.id },
      data: { 
        status: "DONE",
        transferredFrom: null
      }
    });

    // 6. Buat status baru di dinas target
    const newStatus = await prisma.laporanStatus.create({
      data: {
        laporanId,
        dinasId: targetDinasId,
        status: "PENDING",
        transferredFrom: currentDinasId,
        transferReason: reason
      },
      include: {
        Dinas: {
          select: { name: true }
        },
        Laporan: {
          include: {
            User: {
              select: { username: true, email: true }
            },
            jenisKerusakan: true
          }
        }
      }
    });

    console.log("✅ Transfer berhasil:", {
      dariDinas: currentDinasId,
      keDinas: targetDinasId,
      laporanId: laporanId
    });

    return newStatus;

  } catch (error) {
    console.error("❌ SERVICE ERROR:", error.message);
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
        name: 'asc'
      }
    });

    return dinas;
  } catch (error) {
    throw new Error(`Gagal mengambil data dinas: ${error.message}`);
  }
}

module.exports = {
  getLaporanByDinasService,
  updateStatusLaporanService,
  // transferLaporanServices,
  transferLaporanService,
  getAllDinasServices
};












