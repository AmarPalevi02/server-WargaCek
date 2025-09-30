-- AlterTable
ALTER TABLE `User` ADD COLUMN `dinasId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Dinas` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LaporanStatus` (
    `id` VARCHAR(191) NOT NULL,
    `laporanId` VARCHAR(191) NOT NULL,
    `dinasId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'VALIDATED', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'PENDING',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_dinasId_fkey` FOREIGN KEY (`dinasId`) REFERENCES `Dinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LaporanStatus` ADD CONSTRAINT `LaporanStatus_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LaporanStatus` ADD CONSTRAINT `LaporanStatus_dinasId_fkey` FOREIGN KEY (`dinasId`) REFERENCES `Dinas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
