import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_PIPE } from '@nestjs/core';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    SocialModule,
    ChatModule,
    GameModule
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD, 
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}