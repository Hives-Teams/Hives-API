/*
  Warnings:

  - A unique constraint covering the columns `[idDevice]` on the table `RefreshTokenUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `RefreshTokenUser` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `RefreshTokenUser_idDevice_key` ON `RefreshTokenUser`(`idDevice`);
