/*
  Warnings:

  - A unique constraint covering the columns `[Notification]` on the table `RefreshTokenUser` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `RefreshTokenUser` ADD COLUMN `Notification` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RefreshTokenUser_Notification_key` ON `RefreshTokenUser`(`Notification`);
