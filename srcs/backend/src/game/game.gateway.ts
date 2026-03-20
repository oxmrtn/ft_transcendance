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
import { PrismaService } from "prisma/prisma.service";
import { StartGameDto } from "src/dto/start-game.dto";
import { submitCode } from "src/submission/submitCode";
import { ChallengeCache, Challenge } from '../challenges/challenge.cache';

interface PlayerInfos {
	passedChallenge: boolean | null;
	remainingTries: number;
	lastSubmitTime: Date | null;
	online: boolean;
}

export interface CodeResult {
	trace: string;
	result: boolean;
}

type GameState = "waiting" | "playing" | "finished";

const BASE_SUBMIT_TIMEOUT_SECONDS = 15;
const BASE_REMAINING_TRIES = 3;

class GameSession {
	public playerNumber: number;
	public gameId: string;
	public dbGameId: number;
	public players: Map<number, PlayerInfos>;
	public playerTraces: Map<number, CodeResult[]>;
	public gameState: GameState;
	public creatorId: number;
	public selectedChallenge: Challenge;
	public gameTime: Date;
	public rankCounter: number = 1;
	public createdAt: Date;

	constructor(gameId: string, playerNumber: number) {
		this.gameId = gameId;
		this.playerNumber = playerNumber;
		this.createdAt = new Date();
		this.playerTraces = new Map();
	};
};

@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {

	constructor(private prismaService: PrismaService, private challengeCache: ChallengeCache) { }

	@WebSocketServer() server: Server;

	private gameSessions = new Map<string, GameSession>();
	private clientToRoom = new Map<number, string>();

	private async buildWaitingRooms() {
		const waitingGames = Array.from(this.gameSessions.values())
			.filter((game) => game.gameState === "waiting")
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		const creatorIds = waitingGames.map((game) => game.creatorId);
		const creators = await this.prismaService.user.findMany({
			where: { id: { in: creatorIds } },
			select: { id: true, username: true }
		});

		return waitingGames.map((game) => ({
			gameId: game.gameId,
			creatorUsername: creators.find((creator) => creator.id === game.creatorId)?.username ?? null,
			playerCount: game.players.size,
		}));
	}

	public async getWaitingRooms(page: number = 1, limit: number = 100) {
		const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
		const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.floor(limit), 100) : 100;
		const rooms = await this.buildWaitingRooms();
		const start = (safePage - 1) * safeLimit;
		return rooms.slice(start, start + safeLimit);
	}

	private async broadcastWaitingRooms() {
		const rooms = await this.getWaitingRooms(1, 100);
		this.server.emit('waiting-rooms-update', { rooms });
	}

	private clearGame(gameId: string) {
		for (const [userId, roomId] of this.clientToRoom.entries()) {
			if (roomId === gameId) {
				this.clientToRoom.delete(userId);
			}
		}
	}

	handleConnection(@ConnectedSocket() client: Socket) { }

	async handleDisconnect(@ConnectedSocket() client: Socket) {
		const userId: number = client.data.user.userId;
		const gameId: string = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!gameId)
			return;

		if (!currentGame) {
			this.clientToRoom.delete(userId)
			return;
		}

		if (this.clientToRoom.has(userId))
			this.clientToRoom.delete(userId);

		const info = currentGame.players.get(userId);
		if (info) {
			info.online = false;
			currentGame.players.set(userId, info);
		}

		if (currentGame.gameState === "waiting") {
			currentGame.players.delete(userId);

			if (!currentGame.players.size) {
				this.gameSessions.delete(gameId);
				await this.broadcastWaitingRooms();
				return;
			}

			if (userId === currentGame.creatorId)
				currentGame.creatorId = Array.from(currentGame.players.keys())[0];

			this.notifyGameStatus(currentGame);
			await this.broadcastWaitingRooms();
			return;
		}
		
		const inGameIds = this.getInGamePlayerIds(currentGame);
		if (!currentGame.players.size || (inGameIds.length === 0 && currentGame.gameState === "playing")) {
			setTimeout(() => {
				this.closeGame(gameId, currentGame);
			}, 60000);
			return;
		}

		this.notifyGameStatus(currentGame);
	}

	@SubscribeMessage('create-room')
	async createGameRoom(@ConnectedSocket() client: Socket) {
		const playerNumber = 4;
		const gameId = randomUUID();
		const userId: number = client.data.user.userId;

		if (this.clientToRoom.has(userId)) {
			this.errorMessage(client, `${client.data.user.username} already joined another room!`);
			return;
		}

		this.gameSessions.set(gameId, new GameSession(gameId, playerNumber));

		const currentGame = this.gameSessions.get(gameId);

		currentGame.players = new Map();
		currentGame.players.set(userId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null, online: true });
		this.clientToRoom.set(userId, gameId);
		currentGame.creatorId = userId;
		currentGame.gameState = "waiting";

		client.join(`game_${gameId}`);

		const challenges = await this.challengeCache.getAll();
		client.emit('game-info', { event: 'room-created', gameId: gameId, availableChallenges: challenges.map(c => c.title) });
		this.notifyGameStatus(currentGame);
		await this.broadcastWaitingRooms();
	}

	@SubscribeMessage('join-room')
	async handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto) {
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame) {
			this.errorMessage(client, `Room ${gameId} doesn\'t exist!`);
			return;
		}

		if (this.clientToRoom.has(user.userId) && !currentGame.players.has(user.userId)) {
			this.errorMessage(client, `You already join another Room!`);
			return;
		}

		if (currentGame.gameState !== "waiting" && !currentGame.players.has(user.userId)) {
			this.errorMessage(client, `This game has already started!`);
			return;
		}

		if (currentGame.players.size >= currentGame.playerNumber) {
			this.errorMessage(client, `This room is already full!`);
			return;
		}

		if (!currentGame.players.has(user.userId))
			currentGame.players.set(user.userId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null, online: true });
		else {
			const info = currentGame.players.get(user.userId);
			info.online = true;
			currentGame.players.set(user.userId, info);
		}

		if (!currentGame.playerTraces.has(user.userId))
			currentGame.playerTraces.set(user.userId, []);

		this.clientToRoom.set(user.userId, gameId);
		client.join(`game_${gameId}`);

		const challenges = await this.challengeCache.getAll();
		client.emit('game-info', { event: 'room-joined', gameId: gameId, availableChallenges: challenges.map(c => c.title) });
		this.notifyGameStatus(currentGame);
		await this.broadcastWaitingRooms();
	}

	@SubscribeMessage('get-waiting-rooms')
	async getWaitingRoomsSocket(@ConnectedSocket() client: Socket) {
		const rooms = await this.getWaitingRooms(1, 100);
		client.emit('waiting-rooms-update', { rooms });
	}

	@SubscribeMessage('get-game')
	async getGame(@ConnectedSocket() client: Socket) {
		const userId: number = client.data.user.userId;
		const currentGame = Array.from(this.gameSessions.values()).find(game => game.players?.has(userId));

		if (!currentGame || currentGame.gameState === "finished") {
		  client.emit('game-info', { event: 'no-active-game' });
		  return;
		}
		
		const info = currentGame.players.get(userId);
		if (!info) {
		  client.emit('game-info', { event: 'no-active-game' });
		  return;
		}

		this.clientToRoom.set(userId, currentGame.gameId);
		info.online = true;
		currentGame.players.set(userId, info);
		client.join(`game_${currentGame.gameId}`);
		const challenges = await this.challengeCache.getAll();

		client.emit('game-info', {
			event: 'resume-game',
			gameId: currentGame.gameId,
			availableChallenges: challenges.map(c => c.title),
			traces: currentGame.playerTraces.get(userId) ?? []
		});
		this.notifyGameStatus(currentGame);
	}

	@SubscribeMessage('kick-player')
	async kickPlayer(@ConnectedSocket() client: Socket, @MessageBody() payload: KickPlayerDto) {
		const userId = client.data.user.userId;
		const currentGame = this.gameSessions.get(this.clientToRoom.get(userId));
		const targetUsername = payload.targetUsername;
		const targetUser = await this.prismaService.user.findUnique({ where: { username: targetUsername }, select: { id: true } });

		if (!currentGame) {
			this.errorMessage(client, `You are not in a room!`);
			return;
		}

		if (currentGame.gameState !== "waiting") {
			this.errorMessage(client, `This game has already started!`);
			return;
		}

		if (!currentGame.players.has(userId) || userId !== currentGame.creatorId) {
			this.errorMessage(client, `You are not allowed to kick players!`);
			return;
		}

		if (!targetUser) {
			this.errorMessage(client, `User ${targetUsername} not found!`);
			return;
		}

		if (!currentGame.players.has(targetUser.id)) {
			this.errorMessage(client, `User ${targetUsername} is not in this room!`);
			return;
		}

		if (targetUser.id === userId) {
			this.errorMessage(client, `You can't kick yourself!`);
			return;
		}

		currentGame.players.delete(targetUser.id);
		this.clientToRoom.delete(targetUser.id);
		this.server.in(`user_${targetUser.id}`).socketsLeave(`game_${currentGame.gameId}`);

		this.server.to(`user_${targetUser.id}`).emit('game-info', { event: 'room-kicked' });
		this.notifyGameStatus(currentGame);
		await this.broadcastWaitingRooms();
	}

	@SubscribeMessage('leave-room')
	async leaveRoom(@ConnectedSocket() client: Socket) {
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame)
			return;

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

		await this.broadcastWaitingRooms();
	}

	@SubscribeMessage('leave-game')
	async leaveGame(@ConnectedSocket() client: Socket) {
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = gameId !== undefined ? this.gameSessions.get(gameId) : undefined;

		if (!currentGame) {
			this.errorMessage(client, `You are not in a game!`);
			return;
		}

		if (currentGame.gameState === 'waiting') {
			this.errorMessage(client, `You can't leave the battle before it has started!`);
			return;
		}

		currentGame.players.set(userId, { passedChallenge: false, remainingTries: 0, lastSubmitTime: null, online: true });
		await this.prismaService.gameParticipant.update({
			where: {
				gameId_userId: {
					gameId: currentGame.dbGameId,
					userId: userId
				}
			},
			data: {
				rank: null,
				timeTakenMs: 0,
				finalCode: ""
			}
		});

		const inGameIds = this.getInGamePlayerIds(currentGame);
		if (inGameIds.length === 0 && currentGame.gameState === "playing") {
			currentGame.gameState = "finished";
			this.clearGame(currentGame.gameId);
		}

		client.emit('game-info', { event: 'game-left' });
		this.notifyGameStatus(currentGame);
	}

	@SubscribeMessage('start-game')
	async startGame(@ConnectedSocket() client: Socket, @MessageBody() payload: StartGameDto) {
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame) {
			this.errorMessage(client, `You are not in a room!`);
			return;
		}

		if (userId !== currentGame.creatorId) {
			this.errorMessage(client, `You can't start the game!`)
			return;
		}

		if (currentGame.players.size < 2) {
			this.errorMessage(client, `The game need at least two players!`);
			return;
		}

		if (currentGame.gameState !== "waiting") {
			this.errorMessage(client, `The game has already started!`);
			return;
		}

		const challengeName = (payload.challengeName ?? "").trim();
		const challenge: Challenge | undefined = challengeName
			? await this.challengeCache.getByTitle(challengeName)
			: await this.challengeCache.getRandom();

		if (!challenge) {
			this.errorMessage(client, `Challenge "${challengeName}" not found!`);
			return;
		}
		const game = await this.prismaService.game.create({
			data: {
				exerciseId: challenge.id,
				status: "IN_PROGRESS"
			}
		});
		currentGame.dbGameId = game.id;
		currentGame.selectedChallenge = challenge;
		currentGame.players.forEach((_, playerId) => {
			currentGame.players.set(playerId, { passedChallenge: null, remainingTries: BASE_REMAINING_TRIES, lastSubmitTime: null, online: true });
			currentGame.playerTraces.set(playerId, []);
		});
		for (const playerId of currentGame.players.keys()) {
			await this.prismaService.gameParticipant.create({
				data: {
					gameId: currentGame.dbGameId,
					userId: playerId,
					timeTakenMs: 0,
					finalCode: ""
				}
			})
		};
		currentGame.gameTime = new Date();
		currentGame.gameState = "playing";
		this.notifyGameStatus(currentGame);
		await this.broadcastWaitingRooms();
	}

	@SubscribeMessage('code-submit')
	async handleCodeSubmit(@ConnectedSocket() client: Socket, @MessageBody() payload: codeSubmitDto) {
		const userId = client.data.user.userId;
		const gameId = this.clientToRoom.get(userId);
		const currentGame = this.gameSessions.get(gameId);

		if (!currentGame) {
			this.errorMessage(client, `You are not in a game!`);
			return;
		}

		if (!currentGame.selectedChallenge) {
			this.errorMessage(client, `No challenge selected for this game yet!`);
			return;
		}

		if (currentGame.gameState === "waiting") {
			this.errorMessage(client, `The game has not started yet!`);
			return;
		}

		if (currentGame.gameState === "finished") {
			this.errorMessage(client, `The game has already finished!`);
			return;
		}

		const playerInfo = currentGame.players.get(userId);
		if (!playerInfo) {
			this.errorMessage(client, `You are not in this game!`);
			return;
		}

		if (playerInfo.passedChallenge !== null) {
			this.errorMessage(client, `You have already finished this game!`);
			return;
		}

		if (playerInfo.remainingTries <= 0) {
			this.errorMessage(client, `You can't submit code anymore!`);
			return;
		}

		const now = new Date();
		const timeSinceLastSubmit = now.getTime() - (playerInfo.lastSubmitTime?.getTime() ?? 0);
		const penaltyMultiplier = BASE_REMAINING_TRIES - playerInfo.remainingTries;
		const requiredTimeoutMs = BASE_SUBMIT_TIMEOUT_SECONDS * 1000 * penaltyMultiplier;
		if (timeSinceLastSubmit < requiredTimeoutMs) {
			this.errorMessage(client, `You have to wait ${Math.ceil((requiredTimeoutMs - timeSinceLastSubmit) / 1000)}s before submitting again.`);
			return;
		}
		playerInfo.lastSubmitTime = now;
		playerInfo.remainingTries--;

		const codeResult = await submitCode(currentGame.selectedChallenge.title, userId, payload.code);
		const previousTraces = currentGame.playerTraces.get(userId) ?? [];
		currentGame.playerTraces.set(userId, [...previousTraces, { trace: codeResult.trace, result: codeResult.result }]);

		if (playerInfo.remainingTries <= 0 && !codeResult.result)
			playerInfo.passedChallenge = false;
		else if (codeResult.result) {
			playerInfo.passedChallenge = true;
			await this.prismaService.gameParticipant.update({
				where: {
					gameId_userId: {
						gameId: currentGame.dbGameId,
						userId: userId
					}
				},
				data: {
					rank: currentGame.rankCounter++,
					timeTakenMs: now.getTime() - currentGame.gameTime.getTime(),
				}
			});
			const win = currentGame.rankCounter - 1 === 1 ? 0 : 1;
			await this.prismaService.user.update({
				where: { id: userId },
				data: {
					xp: {
						increment: 50 / (currentGame.rankCounter - 1)
					},
					win: {
						increment: win
					}
				}
			});
		}

		if (playerInfo.passedChallenge !== null) {
			await this.prismaService.gameParticipant.update({
				where: {
					gameId_userId: {
						gameId: currentGame.dbGameId,
						userId: userId
					}
				},
				data: {
					finalCode: payload.code
				}
			});
			const inGameIds = this.getInGamePlayerIds(currentGame);
			if (inGameIds.length === 0 && currentGame.gameState === "playing") {
				currentGame.gameState = "finished";

				const winner = await this.prismaService.gameParticipant.findFirst({
					where: {
						gameId: currentGame.dbGameId,
						rank: 1
					},
					select: {
						userId: true
					}
				});

				await this.prismaService.game.update({
					where: { id: currentGame.dbGameId },
					data: {
						status: "FINISHED",
						finishedAt: new Date(),
						winnerId: winner?.userId
					}
				})
				this.clearGame(currentGame.gameId);
				this.gameSessions.delete(currentGame.gameId);
			}
		}
		client.emit('game-info', { event: 'code-result', result: codeResult.result, trace: codeResult.trace, remainingTries: playerInfo.remainingTries });
		this.notifyGameStatus(currentGame);
	}

	private errorMessage(@ConnectedSocket() client: Socket, msg: string) {
		client.emit('game-info', {
			event: 'error',
			message: msg
		});
	}

	private getInGamePlayerIds(game: GameSession): number[] {
		return Array.from(game.players.entries())
			.filter(([, info]) => info && info.passedChallenge === null && info.online)
			.map(([id]) => id);
	}

	private async notifyGameStatus(game: GameSession) {
		if (!game)
			return;

		const playerIds = Array.from(game.players.keys());
		const participants = game.dbGameId
			? await this.prismaService.gameParticipant.findMany({
				where: {
					gameId: game.dbGameId,
					userId: { in: playerIds },
				},
				select: {
					userId: true,
					rank: true,
				},
			})
			: [];
		const rankByUserId = new Map(participants.map((participant) => [participant.userId, participant.rank]));

		const users = await this.prismaService.user.findMany({
			where: { id: { in: playerIds } },
			select: { id: true, username: true, profilePictureUrl: true },
		});

		const players = playerIds
			.map((id) => {
				const user = users.find((u) => u.id === id);
				const info = game.players.get(id);

				if (!user || !info)
					return null;

				return {
					username: user.username,
					profilePictureUrl: user.profilePictureUrl,
					passedChallenge: info.passedChallenge,
					online: info.online,
					rank: rankByUserId.get(id) ?? null,
				};
			})
			.filter((p) => p !== null);

		const creator = await this.prismaService.user.findUnique({
			where: { id: game.creatorId },
			select: { username: true },
		});

		const challenges = await this.challengeCache.getAll();

		this.server.to(`game_${game.gameId}`).emit('game-info', {
			event: 'room-update',
			players,
			gameId: game.gameId,
			creatorUsername: creator?.username ?? null,
			gameState: game.gameState,
			selectedChallenge: game.selectedChallenge,
			availableChallenges: challenges.map(c => c.title),
		});
	}

	private async closeGame( gameId: string, currentGame: GameSession)
	{
		const inGameIds = this.getInGamePlayerIds(currentGame);

		if (!currentGame.players.size || (inGameIds.length === 0 && currentGame.gameState === "playing"))
		{
			currentGame.gameState = "finished";
			this.notifyGameStatus(currentGame);
			this.clearGame(currentGame.gameId);
			this.gameSessions.delete(currentGame.gameId);
			this.gameSessions.delete(gameId);
			if (currentGame.dbGameId) {
				await this.prismaService.game.update({
					where: { id: currentGame.dbGameId },
					data: {
						status: "finished",
						finishedAt: new Date()
					}
				});
			}
		}
	}
}
