import { Controller, Patch, Req, UseGuards} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FastifyRequest } from 'fastify';
import { AuthGuard } from '@nestjs/passport';

interface FastifyRequestWithUser extends FastifyRequest{
  user : {userId: string};
}
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch('update')
  @UseGuards(AuthGuard('jwt'))
  async update(@Req() request: FastifyRequestWithUser)
  {
    const file = await request.file();
    if (file)
      file.filename = 'user_'+request.user.userId+'_avatar.jpg';
      return this.profileService.updatePicture(file);
  }
}