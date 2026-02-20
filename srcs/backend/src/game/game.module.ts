import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
	imports: [AuthModule, PrismaModule],
	providers: [GameGateway]
})
export class GameModule {}
