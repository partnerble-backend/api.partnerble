import { NestFactory } from '@nestjs/core';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export class AppFactory {
  private static swaggerConfig = new DocumentBuilder()
    .setTitle('Partnerble API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'x-api-key')
    .build();

  static async create(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule);
    this.configureApp(app);
    return app;
  }

  private static configureApp(app: INestApplication): void {
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    const document = SwaggerModule.createDocument(app, this.swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  static getSwaggerConfig() {
    return this.swaggerConfig;
  }
}
