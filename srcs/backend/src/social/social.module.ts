import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TokenStrat } from 'src/auth/strategies/TokenStrat';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [
	SocialService, 
	TokenStrat,
],
  controllers: [SocialController],
  exports: [SocialService],
})
export class SocialModule {}