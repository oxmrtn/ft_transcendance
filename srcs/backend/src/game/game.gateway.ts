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
import { KickPlayerDto } from "src/dto/kick-player.dto";
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
	async createGameRoom(@ConnectedSocket() client: Socket)
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

		await this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'room-created', gameId: gameId });
	}

	@SubscribeMessage('join-room')
	async handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
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
			this.errorMessage(client, `You already join this room!`);
			return;
		}

		if (this.clientToRoom.has(user.userId))
		{
			this.errorMessage(client, `You already join another Room!`);
			return;
		}

		if (currentGame.isStarted)
		{
			this.errorMessage(client, `This game has already started!`);
			return;
		}
		
		if (currentGame.roomPlayers.size + 1 >= currentGame.playerNumber)
		{
			this.errorMessage(client, `This room is already full!`);
			return;
		}

		client.join(`game_${gameId}`);
		currentGame.roomPlayers.add(user.userId);
		this.clientToRoom.set(user.userId, gameId);

		await this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'room-joined', gameId: gameId });
	}

	@SubscribeMessage('kick-player')
	async kickPlayer(@ConnectedSocket() client: Socket, @MessageBody() payload: KickPlayerDto)
	{
		const userId = client.data.user.userId;
		const currentGame = this.gameSessions.get(this.clientToRoom.get(userId));
		const targetUsername = payload.targetUsername;
		const targetUser = await this.prismaService.user.findUnique({ where: { username: targetUsername }, select: { id: true } });

		if (!currentGame)
		{
			this.errorMessage(client, `You are not in a room!`);
			return;
		}

		if (currentGame.isStarted)
		{
			this.errorMessage(client, `This game has already started!`);
			return;
		}

		if (!currentGame.roomPlayers.has(userId) || userId !== currentGame.creatorId)
		{
			this.errorMessage(client, `You are not allowed to kick players!`);
			return;
		}

		if (!targetUser)
		{
			this.errorMessage(client, `User ${targetUsername} not found!`);
			return;
		}

		if (!currentGame.roomPlayers.has(targetUser.id))
		{
			this.errorMessage(client, `User ${targetUsername} is not in this room!`);
			return;
		}

		if (targetUser.id === userId)
		{
			this.errorMessage(client, `You can't kick yourself!`);
			return;
		}

		currentGame.roomPlayers.delete(targetUser.id);
		this.clientToRoom.delete(targetUser.id);

		await this.notifyGameStatus(currentGame);
		this.server.to(`user_${targetUser.id}`).emit('game-info', { event: 'room-kicked' });
	}

	@SubscribeMessage('leave-room')
	async leaveRoom(@ConnectedSocket() client: Socket)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `${gameId} room doesn\'t exist!`);
			return;
		}

		client.leave(`game_${gameId}`);
		client.emit('game-info', { event: 'room-left' });

		currentGame.roomPlayers.delete(userId);
		this.clientToRoom.delete(userId);

		if(currentGame.gamePlayers.has(userId))
			currentGame.gamePlayers.delete(userId);
		if (!currentGame.roomPlayers.size)
			this.gameSessions.delete(gameId);
		else {
			if (userId === currentGame.creatorId)
				currentGame.creatorId = Array.from(currentGame.roomPlayers)[0];
			this.notifyGameStatus(currentGame);
		}
	}

	@SubscribeMessage('leave-game')
	async leaveGame(@ConnectedSocket() client: Socket)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `You are not in a Battle!`)
			return;
		}

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

		await this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'game-left' });
	}

	@SubscribeMessage('start-game')
	async startGame(@ConnectedSocket() client: Socket)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (userId !== currentGame.creatorId)
		{
			this.errorMessage(client, `You can't start the battle!`)
			return;
		}

		if (currentGame.roomPlayers.size < 2)
		{
			this.errorMessage(client, `The battle need at least two players!`);
			return;
		}

		if (currentGame.isStarted)
		{
			this.errorMessage(client, `The battle has already started!`);
			return;
		}

		currentGame.gamePlayers = new Set(currentGame.roomPlayers);
		currentGame.isStarted = true;
		await this.notifyGameStatus(currentGame);
		this.server.to(`game_${gameId}`).emit('game-info', { event: 'battle-started' });
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

	private async notifyGameStatus(game: GameSession)
	{
		if (!game)
			return;

		const roomPlayerArray = Array.from(game.roomPlayers);		
		const roomPlayerByName = await this.prismaService.user.findMany({ where: { id: { in: roomPlayerArray } }, select: { username : true, profilePictureUrl : true } });

		const gamePlayerArray = Array.from(game.gamePlayers);
		const gamePlayerByName = await this.prismaService.user.findMany({ where: { id: { in: gamePlayerArray } }, select: { username : true } });
		const gamePlayerArrayByName = gamePlayerByName.map(user => user.username);

		const creatorUsername = await this.prismaService.user.findUnique({ where: { id: game.creatorId }, select: { username : true } });

		this.server.to(`game_${game.gameId}`).emit('game-info', {
			event: 'room-update',
			roomPlayers: roomPlayerByName,
			gamePlayers: gamePlayerArrayByName,
			gameId: game.gameId,
			creatorUsername: creatorUsername?.username
		});
	}
}
