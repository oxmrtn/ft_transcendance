import { Controller, Get, Param, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('history')
export class HistoryController {
  constructor(private gamesService: HistoryService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    async getHistory(@Req() req: any, @Query('page') page = 1, @Query('limit') limit = 10)
    {
      return this.gamesService.getUserGameHistory(req.user.userId, Number(page), Number(limit));
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me/:gameId')
    async getGameDetails(@Req() req: any, @Param('gameId', ParseIntPipe) gameId: number)
    {
      return this.gamesService.getUserGameDetails(req.user.userId, gameId);
    }
}

