import { BadRequestException, Body, Controller, Patch, Req, UseGuards, Get , Param} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyProfile(@Req() request)
  {
    return this.profileService.getMyProfile(request);
  }

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() request, @Body() body)
  {
    return this.profileService.updateProfile(request, body);
  }
}