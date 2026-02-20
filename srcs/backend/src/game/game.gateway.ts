import { randomUUID } from "node:crypto";
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
import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/wsjwt/wsjwt.guard";
import { codeSubmitDto } from "src/dto/code-submit.dto";
import { gameIdDto } from "src/dto/game-id.dto";
import { connected } from "node:process";
import { PrismaService } from "prisma/prisma.service";

class GameSession {
	public playerNumber : number;
	public gameId : string;
	public roomPlayers: Set<number>;
	public gamePlayers: Set<number>;
	public playerSubmitMap: Map<number, number>;
	public isStarted: boolean;
	public creatorId: number;
	
	constructor (gameId: string, playerNumber: number)
	{
		this.gameId = gameId;
		this.playerNumber = playerNumber;
	};
};

@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe ({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect
{

	constructor( private prismaService : PrismaService) {}

	@WebSocketServer() server: Server;

	private gameSessions = new Map<string, GameSession>();
	private clientToRoom = new Map<number, string>();

	handleConnection(@ConnectedSocket() client: Socket) {}

	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		const userId : number = client.data.user.userId;
		const gameId :string = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);
	
		if (!gameId)
			return;

		if (!currentGame)
		{
			this.clientToRoom.delete(userId)
			return;
		}

		if (this.clientToRoom.has(userId))
			this.clientToRoom.delete(userId);

		if (currentGame.gamePlayers.has(userId))
			currentGame.gamePlayers.delete(userId);

		if (currentGame.gamePlayers.size === 1 && currentGame.isStarted)
		{
			const winnerId = Array.from(currentGame.gamePlayers)[0];
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'results',
				winner: winnerId
			});
			currentGame.gamePlayers.clear();
		}

		if (currentGame.roomPlayers.has(userId))
			currentGame.roomPlayers.delete(userId);

		if (!currentGame.roomPlayers.size)
			this.gameSessions.delete(gameId);

		this.server.to(`game_${gameId}`).emit('game-info', {
			event: 'room-status',
			roomPlayers: Array.from(currentGame.roomPlayers),
			gamePlayers: Array.from(currentGame.gamePlayers),
			playerNumber: currentGame.playerNumber,
			gameId: currentGame.gameId
		});
	}

	@SubscribeMessage('create-room')
	createGameRoom(@ConnectedSocket() client: Socket)
	{
		const playerNumber = 4;
		const gameId = randomUUID();
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
		currentGame.creatorId = userId;
		currentGame.isStarted = false;
		currentGame.playerSubmitMap = new Map();

		client.join(`game_${gameId}`);

		this.notifyGameStatus(client, 'room-created');
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

		this.notifyGameStatus(client, 'room-joined');
	}

	@SubscribeMessage('leave-room')
	async leaveRoom(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
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

		client.leave(`game_${gameId}`);

		currentGame.roomPlayers.delete(user.userId);
		this.clientToRoom.delete(user.userId);

		if(currentGame.gamePlayers.has(user.userId))
			currentGame.gamePlayers.delete(user.userId);

		if (!currentGame.roomPlayers.size)
			this.gameSessions.delete(gameId);
		else
		{
			const roomPlayerArray = Array.from(currentGame.roomPlayers);		
			const roomPlayerByName = await this.prismaService.user.findMany({ where: { id: { in: roomPlayerArray } }, select: { username : true, profilePictureUrl : true } });

			const gamePlayerArray = Array.from(currentGame.gamePlayers);
			const gamePlayerByName = await this.prismaService.user.findMany({ where: { id: { in: gamePlayerArray } }, select: { username : true } });
			const gamePlayerArrayByName = gamePlayerByName.map(user => user.username);

			this.server.to(`game_${currentGame.gameId}`).emit('game-info', {
				event: 'room-left',
				roomPlayers: roomPlayerByName,
				gamePlayers: gamePlayerArrayByName,
				gameId: currentGame.gameId
			});
		}
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
		if (!currentGame.playerSubmitMap.has(user.userId))
			currentGame.playerSubmitMap[user.userId] = 0;

		this.notifyGameStatus(client, 'game-joined');
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
		
		if (currentGame.gamePlayers.size === 1 && currentGame.isStarted)
		{
			const winnerId = Array.from(currentGame.gamePlayers)[0];
			this.server.to(`game_${gameId}`).emit('game-info', {
				event: 'results',
				winner: winnerId
			});
			currentGame.gamePlayers.clear();
		}

		this.notifyGameStatus(client, 'game-left');
	}

	@SubscribeMessage('start-game')
	startGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (user.userId !== currentGame.creatorId)
		{
			this.errorMessage(client, `${user.username} can't start Battle!`)
			return;
		}

		if (currentGame.gamePlayers.size < 2)
		{
			this.errorMessage(client, `The battle need at least two players!`);
			return;
		}
		if (currentGame.isStarted)
		{
			this.errorMessage(client, `The battle has already started!`);
			return;
		}

		this.server.to(`game_${gameId}`).emit('game-info', {
			event: 'start' 	
		});
		currentGame.isStarted = true;
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

		++currentGame.playerSubmitMap[user.userId];

		if (currentGame.playerSubmitMap[user.userId] > 3)
		{
			this.errorMessage(client, `${user.username} can't submit code anymore!`)
			currentGame.gamePlayers.delete(user.userID);
		}
		else
		{
			client.to(`game_${gameId}`).emit('game-info', {
				event: 'code-submit',
				player: user.username
			});
			//passer le code a l'api de tests
		}
	}

	private errorMessage(@ConnectedSocket() client : Socket, msg : string)
	{
		client.emit('game-info', {
			event: 'error',
			message: msg
		});
	}

	 private async notifyGameStatus(@ConnectedSocket() client: Socket, event: string)
	{
		const userId : number = client.data.user.userId;
		const currentGame = this.gameSessions.get(this.clientToRoom.get(userId))

		if (!currentGame)
				return;

		const roomPlayerArray = Array.from(currentGame.roomPlayers);		
		const roomPlayerByName = await this.prismaService.user.findMany({ where: { id: { in: roomPlayerArray } }, select: { username : true, profilePictureUrl : true } });

		const gamePlayerArray = Array.from(currentGame.gamePlayers);
		const gamePlayerByName = await this.prismaService.user.findMany({ where: { id: { in: gamePlayerArray } }, select: { username : true } });
		const gamePlayerArrayByName = gamePlayerByName.map(user => user.username);

		this.server.to(`game_${currentGame.gameId}`).emit('game-info', {
			event,
			roomPlayers: roomPlayerByName,
			gamePlayers: gamePlayerArrayByName,
			gameId: currentGame.gameId
		});
	}
}
