/*
  Warnings:

  - Added the required column `deskripsi` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Laporan` ADD COLUMN `deskripsi` VARCHAR(191) NOT NULL;
