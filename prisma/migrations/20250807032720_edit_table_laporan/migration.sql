/*
  Warnings:

  - You are about to drop the column `lokasi` on the `laporan` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Laporan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `laporan` DROP COLUMN `lokasi`,
    ADD COLUMN `latitude` DOUBLE NOT NULL,
    ADD COLUMN `longitude` DOUBLE NOT NULL;
