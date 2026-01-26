import {
	ConnectedSocket,
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection	
	} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/wsjwt/wsjwt.guard";
import { codeSubmitDto } from "src/dto/code-submit.dto";
import { createRoomDto } from "src/dto/create-room.dto";
import { gameIdDto } from "src/dto/game-id.dto";

class Game {
	public playerNumber : number;
	public gameId : string;
	public roomPlayers: Set<number>;
	public gamePlayers: Set<number>;

	constructor (gameId: string, playerNumber: number)
	{
		this.gameId = gameId;
		this.playerNumber = playerNumber;
	};
};

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{

	@WebSocketServer() server: Server;

	private gamesMap = new Map<string, Game>();


	handleConnection(@ConnectedSocket() client: Socket) {}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		//close la game, laisser les autres terminer, compter victoire pour adversaire si multiplayer????
	};

	@SubscribeMessage('create-room')
	createGameRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: createRoomDto)
	{
		const gameId = payload.gameId;

		if (this.gamesMap.has(gameId))
			return;
		
		const playerNumber = payload.playerNumber;
		const user = client.data.user;

		this.gamesMap.set(gameId, new Game(gameId, playerNumber));
		this.gamesMap.get(gameId).roomPlayers.add(user.userId);

		client.join(`game_${gameId}`);

		this.server.to(`game_${gameId}`).emit('game-info', {
			event: 'create-room',
			roomid: gameId,
			newplayer: user.username
		});
	}

	@SubscribeMessage('join-room')
	handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;

		if (this.gamesMap.get(gameId).roomPlayers.has(user.userId))
				return;
		
		client.join(`game_${gameId}`);

		this.gamesMap.get(gameId).roomPlayers.add(user.userId);//limite d'users present dans la room??

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'join-room',
			player: user.username
		});
	}

	@SubscribeMessage('leave-room')
	leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gamesMap.get(gameId);

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'leave-room',
			player: user.username
		});

		currentGame.roomPlayers.delete(user.userId);
		if (!currentGame.roomPlayers.size)//on pourrait aussi faire un event de suppression de la room
			this.gamesMap.delete(gameId);
	}

	@SubscribeMessage('join-game')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gamesMap.get(gameId);

		if (currentGame.gamePlayers.has(user.userId)
			|| !currentGame.roomPlayers.has(user.userId))
			return;

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'join-game',
			player: user.username
		});

		currentGame.gamePlayers.add(user.userId);
		console.log('gameId: ', this.gamesMap.get(payload.gameId));

		if (currentGame.gamePlayers.size === currentGame.playerNumber)
		{
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'start' 	
			});
		}
	}

	@SubscribeMessage('leave-game')
	leaveGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gamesMap.get(gameId);

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'game-leave',
			player: user.username
		});

		currentGame.gamePlayers.delete(user.userId);
		
		if (currentGame.gamePlayers.size === 1)
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'results',
				winner: currentGame.gamePlayers[0]
			});
	}

	@SubscribeMessage('code-submit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'code-submit',
			player: user.username
		});
		
		//passer le code a l'api de tests
	}
}
