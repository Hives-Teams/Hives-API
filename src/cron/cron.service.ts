import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import dayjs from 'dayjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CronService {
  constructor(readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async deleteInactiveAccount(): Promise<void> {
    const user = await this.prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        email: true,
        activate: true,
      },
    });

    // suppression compte non active
    user.forEach(async (u) => {
      if (!u.activate) {
        const diff = dayjs(Date.now()).diff(u.createdAt, 'day');
        if (diff >= 1) {
          Logger.log('suppression du compte ' + u.email);
          await this.prisma.user.delete({
            where: {
              id: u.id,
            },
          });
        }
      }
    });

    const refreshToken = await this.prisma.refreshTokenUser.findMany();

    // suppression device non utilisée depuis 30 jours
    refreshToken.forEach(async (r) => {
      const diff = dayjs(Date.now()).diff(r.updatedAt, 'day');
      if (diff > 30) {
        Logger.log('suppression du device ' + r.idDevice);
        await this.prisma.refreshTokenUser.delete({
          where: {
            idDevice: r.idDevice,
          },
        });
      }
    });
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async deleteForgotPassword(): Promise<void> {
    const forgotPassword = await this.prisma.forgotPassword.findMany();

    forgotPassword.forEach(async (f) => {
      const diff = dayjs(Date.now()).diff(f.createdAt, 'minute');
      if (diff >= 30) {
        await this.prisma.forgotPassword.delete({
          where: {
            id: f.id,
          },
        });
      }
    });
  }
}
