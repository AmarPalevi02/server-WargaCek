-- AlterTable
ALTER TABLE `Laporan` MODIFY `latitude` DOUBLE NULL,
    MODIFY `longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'USER', 'PLN') NOT NULL DEFAULT 'USER';
