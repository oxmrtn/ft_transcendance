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

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{

	@WebSocketServer() server: Server;

	private playerNb : number;
	private gamePlayers = new Set<number>;
	private roomedPlayer = new Set<number>;

	handleConnection(@ConnectedSocket() client: Socket) {}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		//close la game, laisser les autres terminer, compter victoire pour adversaire si multiplayer????
	};

	@SubscribeMessage('create-room')
	createGameRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: createRoomDto)
	{
		this.playerNb = payload.playerNb;
		console.log('init playerNb: ', this.playerNb)
		//verification gameId est unique
		
		this.roomedPlayer.add(client.data.user.userId);

		client.join(`game_${payload.gameId}`);

		this.server.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'create-room',
			roomid: payload.gameId,
			newplayer: client.data.user.username
		});
	}

	@SubscribeMessage('leave-game')
	leaveGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'game-leave',
			player: client.data.user.username
		});

		this.gamePlayers.delete(client.data.user.userId);
		
		if (this.gamePlayers.size === 1)
			this.server.to(`game_${payload.gameId}`).emit('game-info', {
				event: 'results',
				winner: this.gamePlayers[0]
			});
	}

	@SubscribeMessage('leave-room')
	leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'leave-room',
			player: client.data.user.username
		});

		this.roomedPlayer.delete(client.data.user.userId);
	}

	@SubscribeMessage('join-room')
	handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		if (this.roomedPlayer.has(client.data.user.userId))
				return;
		
		client.join(`game_${payload.gameId}`);

		this.roomedPlayer.add(client.data.user.userId);//limite d'users present dans la room??

		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'join-room',
			player: client.data.user.username
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

	@SubscribeMessage('join-game')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		if (this.gamePlayers.has(client.data.user.userId) || !this.roomedPlayer.has(client.data.user.userId))
			return;

		client.to(`game_${payload.gameId}`).emit('game-info', {
			event: 'join-game',
			player: client.data.user.username
		});

		this.gamePlayers.add(client.data.user.userId);

		if (this.gamePlayers.size === this.playerNb)
		{
			this.server.to(`game_${payload.gameId}`).emit('game-info', {
				event: 'start' 	
			});
		}
	}
}
