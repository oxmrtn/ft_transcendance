import { BadRequestException, Body, Controller, Patch, Req, UseGuards, Get , Param} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Param ('username') username : string)
  {
    return this.profileService.getProfile(username);
  }

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() request, @Body() body)
  {
    return this.profileService.updateProfile(request, body);
  }
}