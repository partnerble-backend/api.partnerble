import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SwaggerModule } from '@nestjs/swagger';
import { AppFactory } from '../src/app.factory';

async function generateOpenApiSpec() {
  const app = await AppFactory.create();
  const document = SwaggerModule.createDocument(
    app,
    AppFactory.getSwaggerConfig(),
  );

  const outputPath = join(process.cwd(), 'docs', 'openapi.json');
  mkdirSync(join(process.cwd(), 'docs'), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(document, null, 2));

  console.log(`openapi.json saved to ${outputPath}`);

  await app.close();
}

generateOpenApiSpec().catch((error) => {
  console.error('Error generating OpenAPI spec:', error);
  process.exit(1);
});
