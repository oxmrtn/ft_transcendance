import { Module } from '@nestjs/common';
import { ChallengeCache } from './challenge.cache';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [ChallengeCache, PrismaService],
  exports: [ChallengeCache],
})
export class ChallengeModule {}


