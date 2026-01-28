import { BadRequestException, Body, Controller, Patch, Req, UseGuards} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() request, @Body() body)
  {
    if (!body)
      throw new BadRequestException("Empty request, no data to update");
    if (body.picture)
      {
        body.picture.filename = 'user_'+request.user.userId+'_avatar.jpg';
		    this.profileService.updatePicture(body.picture);
      }
    this.profileService.udpateData(body.username?.value, body.mail?.value, body.password?.value)
    return ('Profile updated !')
  }
}