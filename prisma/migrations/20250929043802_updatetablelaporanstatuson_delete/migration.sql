-- DropForeignKey
ALTER TABLE `LaporanStatus` DROP FOREIGN KEY `LaporanStatus_laporanId_fkey`;

-- DropIndex
DROP INDEX `LaporanStatus_laporanId_fkey` ON `LaporanStatus`;

-- AddForeignKey
ALTER TABLE `LaporanStatus` ADD CONSTRAINT `LaporanStatus_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
