import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe())
  const PORT = process.env.PORT || 4000
  console.log('HOST', process.env.REDIS_HOST)
  console.log('PORT', process.env.REDIS_PORT)
  await app.listen(PORT, () => console.log(`Server has been started on PORT: ${PORT}!`))
}
bootstrap();
