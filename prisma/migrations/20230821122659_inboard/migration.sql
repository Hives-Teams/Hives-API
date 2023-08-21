/*
  Warnings:

  - You are about to drop the column `SubBoard` on the `Board` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Board` DROP COLUMN `SubBoard`,
    ADD COLUMN `InBoard` INTEGER NULL;
