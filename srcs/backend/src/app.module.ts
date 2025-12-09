import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service'; // Importez le service Prisma

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    PrismaService 
  ],
})
export class AppModule {}