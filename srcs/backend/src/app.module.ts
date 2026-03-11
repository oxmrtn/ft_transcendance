import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProfileModule } from './profile/profile.module';
import { GameModule } from './game/game.module';
import { ChallengeCache } from './challenges/challenge.cache';
import { ChallengeModule } from './challenges/challenge.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    AuthModule,
    ChallengeModule,
    SocialModule,
    ChatModule,
    ProfileModule,
    GameModule,
    LeaderboardModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    ChallengeCache,
    {
      provide: APP_GUARD, 
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}