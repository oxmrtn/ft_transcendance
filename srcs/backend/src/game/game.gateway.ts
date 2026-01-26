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
		if (this.gamesMap.has(payload.gameId))
			return;
		
		this.gamesMap.set(payload.gameId, new Game(payload.gameId, payload.playerNumber));
		this.gamesMap.get(payload.gameId).roomPlayers.add(client.data.user.userId);

		client.join(`game_${payload.gameId}`);

		this.server.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'create-room',
			roomid: payload.gameId,
			newplayer: client.data.user.username
		});
	}

	@SubscribeMessage('join-room')
	handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		if (this.gamesMap.get(payload.gameId).roomPlayers.has(client.data.user.userId))
				return;
		
		client.join(`game_${payload.gameId}`);

		this.gamesMap.get(payload.gameId).roomPlayers.add(client.data.user.userId);//limite d'users present dans la room??

		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'join-room',
			player: client.data.user.username
		});
	}

	@SubscribeMessage('leave-room')
	leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'leave-room',
			player: client.data.user.username
		});

		this.gamesMap.get(payload.gameId).roomPlayers.delete(client.data.user.userId);
		if (!this.gamesMap.get(payload.gameId).roomPlayers.size)//on pourrait aussi faire un event de suppression de la room
			this.gamesMap.delete(payload.gameId);
	}

	@SubscribeMessage('join-game')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		if (this.gamesMap.get(payload.gameId).gamePlayers.has(client.data.user.userId)
			|| !this.gamesMap.get(payload.gameId).roomPlayers.has(client.data.user.userId))
			return;

		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'join-game',
			player: client.data.user.username
		});

		this.gamesMap.get(payload.gameId).gamePlayers.add(client.data.user.userId);
		console.log('gameId: ', this.gamesMap.get(payload.gameId));

		if (this.gamesMap.get(payload.gameId).gamePlayers.size === this.gamesMap.get(payload.gameId).playerNumber)
		{
			this.server.to(`game_${payload.gameId}`).emit('game-info', {
				event: 'start' 	
			});
		}
	}

	@SubscribeMessage('leave-game')
	leaveGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'game-leave',
			player: client.data.user.username
		});

		this.gamesMap.get(payload.gameId).gamePlayers.delete(client.data.user.userId);
		
		if (this.gamesMap.get(payload.gameId).gamePlayers.size === 1)
			this.server.to(`game_${payload.gameId}`).emit('game-info', {
				event: 'results',
				winner: this.gamesMap.get(payload.gameId).gamePlayers[0]
			});
	}

	@SubscribeMessage('code-submit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto)
	{
		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'code-submit',
			player: client.data.user.username
		});
		
		//passer le code a l'api de tests
	}
}
