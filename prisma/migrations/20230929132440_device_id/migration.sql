/*
  Warnings:

  - A unique constraint covering the columns `[idDevice]` on the table `RefreshTokenUser` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idDevice` to the `RefreshTokenUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RefreshTokenUser` ADD COLUMN `idDevice` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshTokenUser_idDevice_key` ON `RefreshTokenUser`(`idDevice`);
