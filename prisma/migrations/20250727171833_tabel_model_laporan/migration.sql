-- CreateTable
CREATE TABLE `JenisKerusakan` (
    `id` VARCHAR(191) NOT NULL,
    `jenis_kerusakan` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laporan` (
    `id` VARCHAR(191) NOT NULL,
    `jenisKerusakanId` VARCHAR(191) NOT NULL,
    `foto_url` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NOT NULL,
    `waktu_laporan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_jenisKerusakanId_fkey` FOREIGN KEY (`jenisKerusakanId`) REFERENCES `JenisKerusakan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
