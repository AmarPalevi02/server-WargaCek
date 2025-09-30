-- AlterTable
ALTER TABLE `JenisKerusakan` ADD COLUMN `dinasId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `JenisKerusakan` ADD CONSTRAINT `JenisKerusakan_dinasId_fkey` FOREIGN KEY (`dinasId`) REFERENCES `Dinas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
