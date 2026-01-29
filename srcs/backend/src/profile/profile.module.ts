import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TokenStrat } from 'src/auth/strategies/TokenStrat';
import { AuthService } from 'src/auth/auth.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports : [PrismaModule],
  controllers: [ProfileController],
  providers: [
    ProfileService,
    TokenStrat,
    AuthService
  ],
})
export class ProfileModule {}
