/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Dinas` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Dinas_name_key` ON `Dinas`(`name`);
