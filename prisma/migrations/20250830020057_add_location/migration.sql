/*
  Warnings:

  - Added the required column `location` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `laporan` ADD COLUMN `location` VARCHAR(191) NOT NULL,
    MODIFY `deskripsi` VARCHAR(191) NULL;
