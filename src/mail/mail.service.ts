import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationMail(email: string, code: number): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmation code',
      template: 'mail-confirmation.hbs',
      context: {
        code: code,
      },
    });
  }

  async sendForgotPasswordMail(email: string, code: number): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Mot de passe oublié',
      template: 'mail-confirmation.hbs',
      context: {
        code: code,
      },
    });
  }
}
