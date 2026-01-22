import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { TrimPipe } from './pipes/trim.pipe';
import * as fs from 'fs';

async function bootstrap() {
	const httpsOptions = {
		key: fs.readFileSync('/run/secrets/ssl_key'),
		cert:fs.readFileSync('/run/secrets/ssl_crt'),
	};
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({https: httpsOptions}),
    { cors: true }
  );

	app.useGlobalPipes(new TrimPipe);

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		forbidNonWhitelisted: true,
		transform: true,
		transformOptions: { enableImplicitConversion: true },
	}));

  await app.listen(3333, '0.0.0.0'); 
}

bootstrap();

