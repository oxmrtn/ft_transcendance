import { Controller, 
		Get, Post, Delete, Patch,
		Query, Req, Param,
		UseGuards
	} from '@nestjs/common';
import { SocialService } from './social.service';
import { AuthGuard } from '@nestjs/passport';
import { ParseUserPipe } from '../pipes/parseUser.pipe';
import { SocialGateway } from './social.gateway';
import { PrismaService } from 'prisma/prisma.service';

@Controller('social')
@UseGuards(AuthGuard('jwt'))
export class SocialController
{
	constructor(private readonly socialService: SocialService,
				private readonly socialGateway: SocialGateway,
				private readonly prismaService: PrismaService) {}

	@Get('friends')
	async getFriends(@Req() req)
	{
		const res = await this.socialService.getFriends(req.user.userId);

		this.socialGateway.sendOnlineFriendStatus(req.user.userId);

		return res;
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

		this.socialGateway.newFriendship(req.user, this.prismaService.user.findUnique({ where: targetId}));

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

		this.socialGateway.friendshipRemoved(req.user, this.prismaService.user.findUnique({ where: targetId}));

		return res;
	}

	@Get('request')
	getRequest(@Req() req)
	{
		return this.socialService.getFriendsRequests(req.user.userId);
	}

	@Get('profile/:username')
	getUserProfile(@Req() req, @Param('username') username: string)
	{
		return this.socialService.getUserProfile(username, req.user.userId);
	}
}


