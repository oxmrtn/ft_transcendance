import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GameGateway } from './game.gateway';

@Controller('game')
export class GameController {
	constructor(private gameGateway: GameGateway) {}

	@UseGuards(AuthGuard('jwt'))
	@Get('rooms/waiting')
	async getWaitingRooms(@Query('page') page: number = 1, @Query('limit') limit: number = 100) {
		return this.gameGateway.getWaitingRooms(Number(page), Number(limit));
	}
}
