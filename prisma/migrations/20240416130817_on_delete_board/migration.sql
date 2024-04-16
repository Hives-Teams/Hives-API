-- DropForeignKey
ALTER TABLE `Board` DROP FOREIGN KEY `Board_idUser_fkey`;

-- AddForeignKey
ALTER TABLE `Board` ADD CONSTRAINT `Board_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
