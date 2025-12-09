import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Player } from '@prisma/client';

@Controller('status')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Backend is running with NestJS & Fastify!';
  }

  @Post('player')
  async createPlayer(@Body() data: { username: string }): Promise<Player> {
    // Test de l'insertion dans la BDD via Prisma
    return this.prisma.player.create({
      data: {
        username: data.username,
      },
    });
  }
}