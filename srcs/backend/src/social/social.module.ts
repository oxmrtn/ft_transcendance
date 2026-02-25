import { Module } from '@nestjs/common';
import { SocialService } from './social.service';
import { SocialController } from './social.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TokenStrat } from 'src/auth/strategies/TokenStrat';
import { AuthModule } from 'src/auth/auth.module';
import { SocialGateway } from './social.gateway';

@Module({
	imports: [PrismaModule, AuthModule],
	providers: [
		SocialService,
		TokenStrat,
		SocialGateway
	],
	controllers: [SocialController],
	exports: [SocialService, SocialGateway],
})
export class SocialModule {}