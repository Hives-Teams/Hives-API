/* istanbul ignore file */

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendConfirmationMail(email: string, code: number): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Bienvenue dans la ruche Hives ! 🐝',
      template: 'mail-confirmation.hbs',
      context: {
        code: code,
      },
    });
  }

  async sendForgotPasswordMail(email: string, code: number): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Mot de passe oublié',
      template: 'mail-oublie.hbs',
      context: {
        code: code,
      },
    });
  }

  async sendRequestAccountDelete(email: string): Promise<void> {
    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Suppression de votre compte Hives',
      template: 'mail-delete.hbs',
    });
  }
}
