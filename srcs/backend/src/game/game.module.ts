import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ChallengeModule } from 'src/challenges/challenge.module';

@Module({
	imports: [AuthModule, PrismaModule, ChallengeModule],
	providers: [GameGateway]
})
export class GameModule {}
