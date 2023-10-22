-- DropForeignKey
ALTER TABLE `Tuto` DROP FOREIGN KEY `Tuto_idBoard_fkey`;

-- AddForeignKey
ALTER TABLE `Tuto` ADD CONSTRAINT `Tuto_idBoard_fkey` FOREIGN KEY (`idBoard`) REFERENCES `Board`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
