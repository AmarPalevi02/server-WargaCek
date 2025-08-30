/*
  Warnings:

  - Made the column `deskripsi` on table `laporan` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `laporan` MODIFY `deskripsi` VARCHAR(191) NOT NULL;
