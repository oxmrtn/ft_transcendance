import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ChallengeModule } from 'src/challenges/challenge.module';
import { GameController } from './game.controller';

@Module({
	imports: [AuthModule, PrismaModule, ChallengeModule],
	controllers: [GameController],
	providers: [GameGateway]
})
export class GameModule {}
