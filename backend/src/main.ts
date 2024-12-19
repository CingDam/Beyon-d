import { NestFactory } from '@nestjs/core';
import { IndexModule } from './module/index.module';

async function bootstrap() {
  const app = await NestFactory.create(IndexModule);
  await app.listen(3001);
}
bootstrap();
