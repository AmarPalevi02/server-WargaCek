-- CreateTable
CREATE TABLE `Komentar` (
    `id` VARCHAR(191) NOT NULL,
    `konten` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `laporanId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Komentar_laporanId_idx`(`laporanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Komentar` ADD CONSTRAINT `Komentar_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
