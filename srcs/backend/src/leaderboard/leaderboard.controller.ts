import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('leaderboard')
export class LeaderboardController {

	constructor(private leaderboardService: LeaderboardService) {}

    @UseGuards(AuthGuard('jwt'))
	@Get()
	async getLeaderboard(@Query('page') page: number = 1, @Query('limit') limit: number = 100)
    {
		return this.leaderboardService.getLeaderboard(Number(page), Number(limit));
	}

    @UseGuards(AuthGuard('jwt'))
	@Get('me')
	async getMyRank(@Req() req : any)
    {
		return this.leaderboardService.getMyRank(req.user.userId);
	}
    @UseGuards(AuthGuard('jwt'))
	@Get('around-me')
	async getAroundMe(@Req() req: any)
    {
		return this.leaderboardService.getAroundMe(req.user.userId);
	}
}