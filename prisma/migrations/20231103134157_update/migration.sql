/*
  Warnings:

  - A unique constraint covering the columns `[idUser]` on the table `CodeBeta` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `CodeBeta` ADD COLUMN `idUser` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `CodeBeta_idUser_key` ON `CodeBeta`(`idUser`);

-- AddForeignKey
ALTER TABLE `CodeBeta` ADD CONSTRAINT `CodeBeta_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
