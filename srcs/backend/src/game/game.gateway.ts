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

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{

	@WebSocketServer() server: Server;

	private playerNb : number;
	private readyPlayers = new Set<number>;

	handleConnection(@ConnectedSocket() client: Socket, @MessageBody() gameId: string) {}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		//close la game, laisser les autres terminer, compter victoire pour adversaire si multiplayer????
	};

	@SubscribeMessage('createRoom')
	createGameRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: createRoomDto)
	{
		this.playerNb = payload.playerNb;

		client.join(`game_${payload.gameId}`);
		this.server.to(`game_${payload.gameId}`).emit('gameInfo', {
			newroom: `Welcome to Room ${payload.gameId}`,
			player: `${client.data.user.username} has joined the battle !`
		});//ca peut aussi etre seulement des IDs
	}

	@SubscribeMessage('leaveGame')
	leaveGame(@ConnectedSocket() client: Socket, @MessageBody() gameId: string)
	{
		client.to(`game_${gameId}`).emit('gameInfo', {player: `${client.data.user.username} has leaved the battle !`});
		this.readyPlayers.delete(client.data.user.userId);
		if (this.readyPlayers.size === 1)
			this.server.to(`game_${gameId}`).emit('gameInfo', "You won the Battle ! Congrats !");
	}

	@SubscribeMessage('joinGame')
	handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() gameId: string)
	{
		client.join(`game_${gameId}`);
		client.to(`game_${gameId}`).emit('gameInfo', {player: `${client.data.user.username} has joined the battle !`});
	}

	@SubscribeMessage('codeSubmit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto)
	{
		client.to(`game_${payload.gameId}`).emit('gameInfo', `${client.data.user.username} submit his code !`);
		//passer le code a l'api de test
	}

	@SubscribeMessage('setReady')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() gameId: string)
	{
		if (this.readyPlayers.has(client.data.user.userId))
			return;

		client.to(`game_${gameId}`).emit('gameInfo', `${client.data.user.username} is ready !`);
		this.readyPlayers.add(client.data.user.userId);

		if (this.readyPlayers.size === this.playerNb)
			this.server.to(`game_${gameId}`).emit('gameInfo', 'Start battle !');
	}
}