/* istanbul ignore file */

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Options } from 'nodemailer/lib/smtp-transport';
import { Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  private async getTransport(): Promise<void> {
    const OAuth2 = google.auth.OAuth2;

    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID_MAIL,
      process.env.CLIENT_SECRET_MAIL,
      'https://developers.google.com/oauthplayground',
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN_MAIL,
    });

    const accessToken: string = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          Logger.error(err.response.data.error_description, 'mail.service');
          reject(`Erreur lors de la création du compte : email non envoyé`);
        }
        resolve(token);
      });
    });

    const config: Options = {
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID_MAIL,
        clientSecret: process.env.CLIENT_SECRET_MAIL,
        accessToken: accessToken,
      },
    };
    this.mailerService.addTransporter('gmail', config);
  }

  async sendConfirmationMail(email: string, code: number): Promise<void> {
    await this.getTransport();

    await this.mailerService.sendMail({
      transporterName: 'gmail',
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
    await this.getTransport();

    await this.mailerService.sendMail({
      transporterName: 'gmail',
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
    await this.getTransport();

    await this.mailerService.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: 'Suppression de votre compte Hives',
      template: 'mail-delete.hbs',
    });
  }
}
