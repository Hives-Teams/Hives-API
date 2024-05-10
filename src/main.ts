/* istanbul ignore file */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Hives Backend')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV != 'production') {
    SwaggerModule.setup('swagger', app, document);
  }

  app.enableCors({
    origin: [
      'http://localhost:3000/',
      'https://hives-dev-7da4a04fb1e4.herokuapp.com/',
    ],
    methods: 'GET,HEAD,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
  });
  app.use(helmet());

  await app.listen(process.env.PORT);
}
bootstrap();
