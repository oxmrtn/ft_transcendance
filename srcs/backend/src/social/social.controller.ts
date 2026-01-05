import { Controller, Get, Post, Delete, Query, Req, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { SocialService } from './social.service';

/* modifier req.user.id manuellement pout tester */
@Controller('social')
export class SocialController {
	constructor(private readonly socialService: SocialService) {}

	@Get('search')
	search(@Query('q') query: string) {
		return this.socialService.searchUsers(query);
	}

	@Get('friends')
	getFriends(@Req() req) {
		return this.socialService.getFriends(1);
	}

	@Post('request/:id')
	sendRequest(@Req() req, @Param('id', ParseIntPipe) receiverId: number) {
		return this.socialService.sendFriendRequest(req.user.id, receiverId);
	}

	@Patch('request/:id/accept')
	accept(@Req() req, @Param('id', ParseIntPipe) friendId: number) {
		return this.socialService.handleRequest(req.user.id, friendId, true);
	}

	@Patch('request/:id/reject')
	reject(@Req() req, @Param('id', ParseIntPipe) friendId: number) {
		return this.socialService.handleRequest(req.user.id, friendId, false);
	}

	@Delete('friends/:id')
	remove(@Req() req, @Param('id', ParseIntPipe) friendId: number) {
		return this.socialService.removeFriend(req.user.id, friendId);
	}
}


