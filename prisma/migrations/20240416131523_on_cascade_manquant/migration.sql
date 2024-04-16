-- DropForeignKey
ALTER TABLE `ForgotPassword` DROP FOREIGN KEY `ForgotPassword_idUser_fkey`;

-- DropForeignKey
ALTER TABLE `RefreshTokenUser` DROP FOREIGN KEY `RefreshTokenUser_idUser_fkey`;

-- AddForeignKey
ALTER TABLE `ForgotPassword` ADD CONSTRAINT `ForgotPassword_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshTokenUser` ADD CONSTRAINT `RefreshTokenUser_idUser_fkey` FOREIGN KEY (`idUser`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
