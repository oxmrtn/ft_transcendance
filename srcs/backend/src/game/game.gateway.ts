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

class GameSession {
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

	private gameSessions = new Map<string, GameSession>();
	private clientToRoom = new Map<number, string>();


	handleConnection(@ConnectedSocket() client: Socket) {}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		const userId : number = client.data.user.userId;
		const gameId :string = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);
	
		if (!gameId || !currentGame)
			return;

		if (this.clientToRoom.has(userId))
			this.clientToRoom.delete(userId);

		if (currentGame.gamePlayers.has(userId))
			currentGame.gamePlayers.delete(userId);

		if (currentGame.gamePlayers.size === 1)
		{
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'results',
				winner: currentGame.gamePlayers[0]
			});
			currentGame.gamePlayers.clear;
		}

		if (currentGame.roomPlayers.has(userId))
			currentGame.roomPlayers.delete(userId);

		if (!currentGame.roomPlayers.size)
			this.gameSessions.delete(gameId);

		this.server.to(`game_${gameId}`).emit('game-info', {
			event: 'room-status',
			roomPlayers: currentGame.roomPlayers,
			gamePlayers: currentGame.gamePlayers,
			playerNumber: currentGame.playerNumber,
			gameId: currentGame.gameId
		});
	}

	@SubscribeMessage('create-room')
	createGameRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: createRoomDto)
	{
		const gameId = payload.gameId;

		if (this.gameSessions.has(gameId))
		{
			this.errorMessage(client, `Room ${gameId} already exist !`);
			return;
		}
		
		const playerNumber = payload.playerNumber;
		const userId : number = client.data.user.userId;

		if (this.clientToRoom.has(userId))
		{
			this.errorMessage(client, `${client.data.user.username} already join anonther room!`);
			return;
		}

		this.gameSessions.set(gameId, new GameSession(gameId, playerNumber));

		const currentGame = this.gameSessions.get(gameId);
		
		currentGame.roomPlayers = new Set();
		currentGame.roomPlayers.add(userId);
		currentGame.gamePlayers = new Set();
		this.clientToRoom.set(userId, gameId);

		client.join(`game_${gameId}`);

		this.notifyGameStatus(client);
	}

	@SubscribeMessage('join-room')
	handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage( client, `Room ${gameId} doesn\'t exist!`);
			return;
		}

		if (currentGame.roomPlayers.has(user.userId))
		{
			this.errorMessage(client, `${user.username} already join this room!`);
			return;
		}

		if (this.clientToRoom.has(user.userId))
		{
			this.errorMessage(client, `${user.username} already join another Room!`);
			return;
		}
		
		client.join(`game_${gameId}`);

		if (currentGame.roomPlayers.size >= currentGame.playerNumber)
		{
			this.errorMessage(client, `This room is already full!`);
			return;
		}

		currentGame.roomPlayers.add(user.userId);
		this.clientToRoom.set(user.userId, gameId);

		this.notifyGameStatus(client);
	}

	@SubscribeMessage('leave-room')
	leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `${gameId} room doesn\'t exist!`);
			return;
		}

		if (!currentGame.roomPlayers.has(user.userId))
		{
			this.errorMessage(client, ` There is no user ${user.username} in this room!`);
			return;
		}			

		currentGame.roomPlayers.delete(user.userId);
		this.clientToRoom.delete(user.userId);

		if (!currentGame.roomPlayers.size)
			this.gameSessions.delete(gameId);
	}

	@SubscribeMessage('join-game')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `Room ${gameId} doesn\'t exist!`);
			return;
		}

		if (currentGame.gamePlayers.has(user.userId))
		{
			this.errorMessage(client, `${user.username} already joined this Battle!`);
			return;
		}

		if (!currentGame.roomPlayers.has(user.userId))
		{
			this.errorMessage(client, `${user.userId} can't join this Battle!`);
			return;
		}

		if (currentGame.gamePlayers.size >= currentGame.playerNumber)
		{
			this.errorMessage(client, `This Battle is already full!`);
			return;
		}

		currentGame.gamePlayers.add(user.userId);

		this.notifyGameStatus(client);

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
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `Room ${gameId} doesn\'t exist!`)
			return;
		}
		
		if (!currentGame.gamePlayers.has(user.userId))
		{
			this.errorMessage(client, `There is no user ${user.username} in this Battle!`)
			return;
		}

		currentGame.gamePlayers.delete(user.userId);
		
		if (currentGame.gamePlayers.size === 1)
		{
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'results',
				winner: currentGame.gamePlayers[0]
			});
			currentGame.gamePlayers.clear;
		}
	}

	@SubscribeMessage('code-submit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `Room ${gameId} doesn\'t exist!`)
			return;
		}
		
		if (!currentGame.gamePlayers.has(user.userId))
		{
			this.errorMessage(client, `There is no user ${user.username} in this Battle!`)
			return;
		}

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'code-submit',
			player: user.username
		});
		//passer le code a l'api de tests
	}

	private errorMessage(@ConnectedSocket() client : Socket, msg : string)
	{
		client.emit('game-info', {
				event: 'error',
				message: msg
			});
	}

	private notifyGameStatus(@ConnectedSocket() client: Socket)
	{
		const userId : number = client.data.user.userId;
		const currentGame = this.gameSessions.get(this.clientToRoom.get(userId))

		this.server.to(`game_${currentGame.gameId}`).emit('game-info', {
			event: 'room-status',
			roomPlayers: currentGame.roomPlayers,
			gamePlayers: currentGame.gamePlayers,
			playerNumber: currentGame.playerNumber,
			gameId: currentGame.gameId
		});
	}
}
