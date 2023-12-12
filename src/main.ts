import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // caca prout

  const config = new DocumentBuilder()
    .setTitle('Hives Backend')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  if (process.env.NODE_ENV != 'production') {
    SwaggerModule.setup('swagger', app, document);
  }

  app.enableCors();
  app.use(helmet());

  await app.listen(process.env.PORT);
}
bootstrap();
