import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TokenStrat } from 'src/auth/strategies/TokenStrat';

@Module({
  imports: [PrismaModule],
  providers: [
	SocialService, 
	TokenStrat
],
  controllers: [SocialController],
})
export class SocialModule {}