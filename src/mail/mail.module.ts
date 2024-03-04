import { Logger, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { google } from 'googleapis';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async () => {
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

        return {
          transport: {
            service: 'gmail',
            auth: {
              type: 'OAuth2',
              user: process.env.EMAIL,
              clientId: process.env.CLIENT_ID_MAIL,
              clientSecret: process.env.CLIENT_SECRET_MAIL,
              accessToken: accessToken,
            },
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
