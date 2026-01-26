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

	private gamesMap = new Map<string, GameSession>();


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
			return client.emit('game-info', {
		event: 'error',
		message: 'This room already exist !'
	});
		
		const playerNumber = payload.playerNumber;
		const user = client.data.user;

		this.gamesMap.set(gameId, new GameSession(gameId, playerNumber));

		const currentGame = this.gamesMap.get(gameId);
		
		currentGame.roomPlayers = new Set();
		currentGame.roomPlayers.add(user.userId);
		currentGame.gamePlayers = new Set();

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
		const currentGame = this.gamesMap.get(gameId);

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
		
		client.join(`game_${gameId}`);

		if (currentGame.roomPlayers.size >= currentGame.playerNumber)
		{
			this.errorMessage(client, `This room is already full!`);
			return;
		}

		currentGame.roomPlayers.add(user.userId);

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

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'leave-room',
			player: user.username
		});

		currentGame.roomPlayers.delete(user.userId);
		if (!currentGame.roomPlayers.size)
			this.gamesMap.delete(gameId);
	}

	@SubscribeMessage('join-game')
	launchBattle(@ConnectedSocket() client: Socket, @MessageBody() payload: gameIdDto)
	{
		const gameId = payload.gameId;
		const user = client.data.user;
		const currentGame = this.gamesMap.get(gameId);

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

		client.to(`game_${gameId}`).emit('game-info', {
			event: 'join-game',
			player: user.username
		});

		currentGame.gamePlayers.add(user.userId);

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
		const currentGame = this.gamesMap.get(gameId);

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
}
