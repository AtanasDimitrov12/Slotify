import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('process.cwd():', process.cwd());
  console.log('JWT_SECRET present:', !!process.env.JWT_SECRET);
  console.log('JWT_SECRET value:', process.env.JWT_SECRET);
  app.enableCors({
    origin: ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(4000);
}
bootstrap();