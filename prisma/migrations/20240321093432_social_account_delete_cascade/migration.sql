-- DropForeignKey
ALTER TABLE `SocialAccount` DROP FOREIGN KEY `SocialAccount_userId_fkey`;

-- AddForeignKey
ALTER TABLE `SocialAccount` ADD CONSTRAINT `SocialAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
