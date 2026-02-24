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
import { waitForDebugger } from "node:inspector";
import { StartGameDto } from "src/dto/start-game.dto";

interface Challenge {
	name: string;
	description: string;
}

interface PlayerInfos {
	passedChallenge: boolean | null;
	remainingTries: number;
	lastSubmitTime: Date | null;
}

interface CodeResult {
	trace: string;
	result: boolean;
}

type GameState = "waiting" | "playing" | "finished";

const BASE_SUBMIT_TIMEOUT_SECONDS = 15;
const BASE_REMAINING_TRIES = 3;

const CHALLENGES : Challenge[] = [
	{
		name: "strlen",
		description: `Assignment name  : ft_strlen
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named ft_strlen that takes a string as a parameter and returns
its length.

The length of a string is the number of characters that precede the terminating
NUL character.

Your function must be declared as follows:

int ft_strlen(char *str);`
	},
	{
		name: "pyramyd",
		description: `Assignment name  : pyramyd
Allowed functions: write
-------------------------------------------------------------------------------

Write a function named pyramid that takes an integer 'size' as a parameter and
displays a left-aligned half-pyramid of '*' characters on the standard output.
The 'size' parameter represents the number of rows of the pyramid.
Your function must be declared as follows:
void pyramid(int size);
-------------------------------------------------------------------------------

Examples:
If size is 2, the expected output is:
*
**
If size is 5, the expected output is:
*
**
***
****
*****`
	},
	{
		name: "min_range",
		description: `Assignment name  : min_range
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named min_range that takes an array of integers and its length
as parameters, and returns the minimum absolute difference between any two
elements in the array.

If the array's length is less than 2, the function must return 0.

Your function must be declared as follows:

unsigned int min_range(int *arr, unsigned int len);
-------------------------------------------------------------------------------
Allowed functions: none
-------------------------------------------------------------------------------

Write a function named min_range that takes an array of integers and its length
as parameters, and returns the minimum absolute difference between any two
elements in the array.

If the array's length is less than 2, the function must return 0.

Your function must be declared as follows:

unsigned int min_range(int *arr, unsigned int len);
-------------------------------------------------------------------------------
Examples:
If arr is {1, 5, 12, 18, 9} and len is 5, the expected output is 4
(because the absolute difference between 5 and 9 is 4, which is the minimum).

If arr is {3} and len is 1, the expected output is 0.`
	}
];

class GameSession {
	public playerNumber : number;
	public gameId : string;
	public players: Map<number, PlayerInfos>;
	public gameState: GameState;
	public creatorId: number;
	public selectedChallenge: Challenge;
	
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

		if (currentGame.players.has(userId))
			currentGame.players.delete(userId);

		if (!currentGame.players.size)
			this.gameSessions.delete(gameId);

		const inGameIds = this.getInGamePlayerIds(currentGame);
		if (inGameIds.length === 0 && currentGame.gameState === "playing")
			currentGame.gameState = "finished";

		this.notifyGameStatus(currentGame);
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
		
		currentGame.players = new Map();
		currentGame.players.set(userId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null });
		this.clientToRoom.set(userId, gameId);
		currentGame.creatorId = userId;
		currentGame.gameState = "waiting";

		client.join(`game_${gameId}`);

		await this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'room-created', gameId: gameId, availableChallenges: CHALLENGES.map((c) => c.name) });
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

		if (currentGame.players.has(user.userId))
		{
			this.errorMessage(client, `You already join this room!`);
			return;
		}

		if (this.clientToRoom.has(user.userId))
		{
			this.errorMessage(client, `You already join another Room!`);
			return;
		}

		if (currentGame.gameState !== "waiting")
		{
			this.errorMessage(client, `This game has already started!`);
			return;
		}
		
		if (currentGame.players.size + 1 >= currentGame.playerNumber)
		{
			this.errorMessage(client, `This room is already full!`);
			return;
		}

		client.join(`game_${gameId}`);
		currentGame.players.set(user.userId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null });
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

		if (currentGame.gameState !== "waiting")
		{
			this.errorMessage(client, `This game has already started!`);
			return;
		}

		if (!currentGame.players.has(userId) || userId !== currentGame.creatorId)
		{
			this.errorMessage(client, `You are not allowed to kick players!`);
			return;
		}

		if (!targetUser)
		{
			this.errorMessage(client, `User ${targetUsername} not found!`);
			return;
		}

		if (!currentGame.players.has(targetUser.id))
		{
			this.errorMessage(client, `User ${targetUsername} is not in this room!`);
			return;
		}

		if (targetUser.id === userId)
		{
			this.errorMessage(client, `You can't kick yourself!`);
			return;
		}

		currentGame.players.delete(targetUser.id);
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
			this.errorMessage(client, `Room doesn\'t exist!`);
			return;
		}

		client.leave(`game_${gameId}`);
		client.emit('game-info', { event: 'room-left' });

		currentGame.players.delete(userId);
		this.clientToRoom.delete(userId);

		if (!currentGame.players.size)
			this.gameSessions.delete(gameId);
		else {
			if (userId === currentGame.creatorId)
				currentGame.creatorId = Array.from(currentGame.players.keys())[0];
			this.notifyGameStatus(currentGame);
		}
	}

	@SubscribeMessage('leave-game')
	async leaveGame(@ConnectedSocket() client: Socket)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = gameId !== undefined ? this.gameSessions.get(gameId) : undefined;

		if (!currentGame)
		{
			this.errorMessage(client, `You are not in a battle!`);
			return;
		}

		currentGame.players.set(userId, { passedChallenge: false, remainingTries: 0, lastSubmitTime: null });

		const inGameIds = this.getInGamePlayerIds(currentGame);
		if (inGameIds.length === 0 && currentGame.gameState === "playing")
			currentGame.gameState = "finished";

		await this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'game-left' });
	}

	@SubscribeMessage('start-game')
	async startGame(@ConnectedSocket() client: Socket, @MessageBody() payload: StartGameDto)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `You are not in a room!`);
			return;
		}

		if (userId !== currentGame.creatorId)
		{
			this.errorMessage(client, `You can't start the battle!`)
			return;
		}

		if (currentGame.players.size < 2)
		{
			this.errorMessage(client, `The battle need at least two players!`);
			return;
		}

		if (currentGame.gameState !== "waiting")
		{
			this.errorMessage(client, `The battle has already started!`);
			return;
		}

		const challengeName = payload.challengeName.trim() ?? null;
		const challenge = !challengeName ? CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]
			: CHALLENGES.find((c) => c.name === challengeName);
		
		if (!challenge)
		{
			this.errorMessage(client, `Challenge "${challengeName}" not found!`);
			return;
		}

		currentGame.selectedChallenge = challenge;
		currentGame.players.forEach((_, playerId) => {
			currentGame.players.set(playerId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null });
		});
		currentGame.gameState = "playing";

		await this.notifyGameStatus(currentGame);
	}

	@SubscribeMessage('code-submit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto)
	{
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
		{
			this.errorMessage(client, `Room ${gameId} doesn\'t exist!`)
			return;
		}
		
		if (currentGame.gameState === "waiting")
		{
			this.errorMessage(client, `The battle has not started yet!`);
			return;
		}

		if (currentGame.gameState === "finished")
		{
			this.errorMessage(client, `The battle has already finished!`);
			return;
		}

		const playerInfo = currentGame.players.get(userId);
		if (!playerInfo)
		{
			this.errorMessage(client, `You are not in this Battle!`);
			return;
		}

		if (playerInfo.remainingTries <= 0)
		{
			this.errorMessage(client, `You can't submit code anymore!`);
			return;
		}

		const now = new Date();
		const timeSinceLastSubmit = now.getTime() - (playerInfo.lastSubmitTime?.getTime() ?? 0);
		const penaltyMultiplier = BASE_REMAINING_TRIES - playerInfo.remainingTries;
		const requiredTimeoutMs = BASE_SUBMIT_TIMEOUT_SECONDS * 1000 * penaltyMultiplier;
		if (timeSinceLastSubmit < requiredTimeoutMs)
		{
			this.errorMessage(client, `You have to wait ${Math.ceil((requiredTimeoutMs - timeSinceLastSubmit) / 1000)}s before submitting again.`);
			return;
		}
		playerInfo.lastSubmitTime = now;
		playerInfo.remainingTries--;

		const codeResult: CodeResult = { trace: 'trace description', result: false }; // remplacer par appel api de test

		if (playerInfo.remainingTries <= 0 && !codeResult.result)
			playerInfo.passedChallenge = false;
		else if (codeResult.result)
			playerInfo.passedChallenge = true;

		if (playerInfo.passedChallenge !== null) {
			const inGameIds = this.getInGamePlayerIds(currentGame);
			if (inGameIds.length === 0 && currentGame.gameState === "playing")
				currentGame.gameState = "finished";
		}

		this.notifyGameStatus(currentGame);
		client.emit('game-info', { event: 'code-result', result: codeResult.result, trace: codeResult.trace, remainingTries: playerInfo.remainingTries });
	}

	private errorMessage(@ConnectedSocket() client : Socket, msg : string)
	{
		client.emit('game-info', {
			event: 'error',
			message: msg
		});
	}

	private getInGamePlayerIds(game: GameSession): number[]
	{
		return Array.from(game.players.entries())
			.filter(([, info]) => info.passedChallenge === null)
			.map(([id]) => id);
	}

	private async notifyGameStatus(game: GameSession)
	{
		if (!game)
			return;

		const playerIds = Array.from(game.players.keys());
		const users = await this.prismaService.user.findMany({
			where: { id: { in: playerIds } },
			select: { id: true, username: true, profilePictureUrl: true },
		});

		const players = playerIds.map((id) => {
			const user = users.find((u) => u.id === id);
			const info = game.players.get(id);
			return {
				username: user.username,
				profilePictureUrl: user.profilePictureUrl,
				passedChallenge: info.passedChallenge,
			};
		});

		const creatorUsername = await this.prismaService.user.findUnique({ where: { id: game.creatorId }, select: { username: true } });

		this.server.to(`game_${game.gameId}`).emit('game-info', {
			event: 'room-update',
			players,
			gameId: game.gameId,
			creatorUsername: creatorUsername.username,
			gameState: game.gameState,
			selectedChallenge: game.selectedChallenge,
		});
	}
}
