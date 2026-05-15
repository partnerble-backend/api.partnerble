import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function generate() {
  const outputPath = process.env.OUTPUT_PATH;
  if (!outputPath) {
    console.error('OUTPUT_PATH environment variable is required');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Partnerble API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
  console.log(`openapi.json saved to ${outputPath}`);

  await app.close();
  process.exit(0);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
