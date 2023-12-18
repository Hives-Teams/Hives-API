/*
  Warnings:

  - You are about to drop the `CodeBeta` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CodeBeta` DROP FOREIGN KEY `CodeBeta_idUser_fkey`;

-- DropTable
DROP TABLE `CodeBeta`;
