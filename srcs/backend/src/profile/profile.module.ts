import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TokenStrat } from 'src/auth/strategies/TokenStrat';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService,
    TokenStrat
  ],
})
export class ProfileModule {}
