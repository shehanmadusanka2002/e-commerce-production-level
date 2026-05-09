import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import serverlessExpress from '@vendia/serverless-express';

let cachedApp: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  
  app.enableCors();

  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: any, res: any) {
  try {
    if (!cachedApp) {
      cachedApp = await bootstrap();
    }
    return cachedApp(req, res);
  } catch (error: any) {
    console.error("FATAL VERCEL BOOTSTRAP ERROR:", error);
    res.status(500).json({
      error: "Serverless function crashed during bootstrap",
      message: error.message,
      stack: error.stack,
    });
  }
}

// Start local server if not running in Vercel
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    const app = await NestFactory.create(AppModule);
    app.use(json({ limit: '10mb' }));
    app.use(urlencoded({ extended: true, limit: '10mb' }));
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.listen(process.env.PORT ?? 3000);
    console.log(`Application is running locally on port 3000`);
  })();
}
