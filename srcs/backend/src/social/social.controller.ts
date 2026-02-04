import { Controller, 
		Get, Post, Delete, Patch,
		Query, Req, Param,
		UseGuards
	} from '@nestjs/common';
import { SocialService } from './social.service';
import { SearchQueryDto } from 'src/dto/search-query.dto';
import { AuthGuard } from '@nestjs/passport';
import { ParseUserPipe } from '../pipes/parseUser.pipe';
import { SocialGateway } from './social.gateway';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController
{
	constructor(private readonly socialService: SocialService,
				private readonly socialGateway: SocialGateway) {}

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
	async accept(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		const res = await this.socialService.handleRequest(req.user.userId, targetId, true);

		this.socialGateway.newFriendship(req.user.userId, targetId);

		return res;
	}

	@Patch('request/:targetName/reject')
	reject(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		return this.socialService.handleRequest(req.user.userId, targetId, false);
	}

	@Delete('friends/:targetName')
	async remove(@Req() req, @Param('targetName', ParseUserPipe) targetId: any)
	{
		const res = await this.socialService.removeFriend(req.user.userId, targetId);

		this.socialGateway.friendshipRemoved(req.user.userId, targetId);

		return res;
	}

	@Get('request')
	getRequest(@Req() req)
	{
		return this.socialService.getFriends(req.user.userId, 'PENDING');
	}
}


