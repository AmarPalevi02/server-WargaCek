const DINAS_CONFIG = {
  PLN: {
    allowedTransfers: ["POLDA", "PU"],
    jenisKerusakan: [
      "Listrik",
      "Lampu Jalan",
      "Traffic Light",
      "Jaringan Listrik",
    ],
  },

  POLDA: {
    allowedTransfers: ["PLN", "DAMKAR", "PU"],
    jenisKerusakan: [
      "Lalu Lintas",
      "Kecelakaan",
      "Pengaturan Jalan",
      "Keamanan",
    ],
  },

  DAMKAR: {
    allowedTransfers: ["PLN", "POLDA", "PU"],
    jenisKerusakan: ["Kebakaran", "Kebakaran Listrik", "Kebakaran Bangunan"],
  },
  
  PU: {
    allowedTransfers: ["PLN", "POLDA", "DAMKAR"],
    jenisKerusakan: [
      "Jalan Rusak",
      "Saluran Air",
      "Gorong-gorong",
      "Infrastruktur",
    ],
  },
};

const ROLE_PERMISSIONS = {
  ADMIN: {
    canManageUsers: true,
    canManageAllLaporan: true,
    canManageDinas: true,
    canAccessDashboard: true,
  },

  DINAS: {
    canManageUsers: false,
    canManageAllLaporan: false,
    canManageDinas: false,
    canAccessDashboard: true,
    canViewLaporan: true,
    canUpdateStatus: true,
    canTransferLaporan: true,
  },

  USER: {
    canManageUsers: false,
    canManageAllLaporan: false,
    canManageDinas: false,
    canAccessDashboard: false,
    canViewLaporan: true,
    canCreateLaporan: true,
    canVote: true,
    canComment: true,
  },
};

// List dinas yang boleh akses dashboard
const ALLOWED_DINAS_DASHBOARD = ["PLN", "POLDA", "DAMKAR", "PU"];

module.exports = {
  DINAS_CONFIG,
  ROLE_PERMISSIONS,
  ALLOWED_DINAS_DASHBOARD,
};
