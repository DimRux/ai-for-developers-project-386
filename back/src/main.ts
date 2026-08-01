import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);
  const frontOrigin = config.get<string>('FRONT_ORIGIN', 'http://localhost:5173');

  app.setGlobalPrefix('api/v1');

  app.enableCors({ origin: frontOrigin.split(','), credentials: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalFilters(new ApiExceptionFilter());

  await app.listen(port);
  console.log(`Backend running on http://localhost:${port}/api/v1`);
}
bootstrap();
