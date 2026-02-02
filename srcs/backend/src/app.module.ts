import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { SocialModule } from './social/social.module';
import { ChatModule } from './chat/chat.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ // C'est un rate limiter unique, mais au besoin on pourra en definir des differents (genre plus strict pour les routes publiques)
      ttl: 60000, // Ici on configure le temps en ms pour la fenetre dans laquelle les requetes sont comptees
      limit: 10, // Ici on configure le nombre de requetes autorisees dans la fenetre 
    }]),
    AuthModule,
    SocialModule,
    ChatModule,
    ProfileModule
  ],
  controllers: [AppController],
  providers: [
    PrismaService,
    { // La on ajoute un guard global qui s appliquera sur toutes les routes, et qui instancie un ThrottleGuard (configure juste au dessus dans le module)
      provide: APP_GUARD, 
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule {}