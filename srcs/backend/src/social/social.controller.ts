import { Controller, 
		Get, Post, Delete, Patch,
		Query, Req, Param,
		UseGuards
	} from '@nestjs/common';
import { SocialService } from './social.service';
import { SearchQueryDto } from 'src/dto/search-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { ParseUserPipe } from '../pipes/parseUser.pipe';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController
{
	constructor(private readonly socialService: SocialService) {}

	@Get('search')
	search(@Query() query: SearchQueryDto)
	{
		return this.socialService.searchUsers(query.q);
	}

	@Get('friends')
	getFriends(@Req() req)
	{
		return (this.socialService.getFriends(req.user.userId, 'ACCEPT'));
	}

	@Post('request/:targetName')
	sendRequest(@Req() req, @Param('targetName', ParseUserPipe) targetId: any) 
	{
		return this.socialService.sendFriendRequest(req.user.userId, targetId);
	}

	@Patch('request/:targetName/accept')
	accept(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		return this.socialService.handleRequest(req.user.userId, targetId, true);
	}

	@Patch('request/:targetName/reject')
	reject(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		return this.socialService.handleRequest(req.user.userId, targetId, false);
	}

	@Delete('friends/:targetName')
	remove(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		return this.socialService.removeFriend(req.user.userId, targetId);
	}

	@Get('request')
	getRequest(@Req() req)
	{
		return this.socialService.getFriends(req.user.userId, 'PENDING');
	}
}


