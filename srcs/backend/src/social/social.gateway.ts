import {
	ConnectedSocket,
	OnGatewayDisconnect,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection	
	} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/wsjwt/wsjwt.guard";
import { SocialService } from "./social.service";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class SocialGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(private socialService: SocialService) {}

	private onlineUsers = new Map<number, Set<string>>();

	async handleConnection(@ConnectedSocket() client: Socket)
	{
		if (!client.data.user)
			return;

		const userId = client.data.user.userId;
		const user = client.data.user;

		if (!this.onlineUsers.has(userId))
			this.onlineUsers.set(userId, new Set());

		this.onlineUsers.get(userId).add(client.id);

		if (this.onlineUsers.get(userId).size === 1)
			await this.handleOnlineUser(user);

		//await this.sendOnlineFriendStatus(client);

		await client.join(`user_${userId}`);
	}

	handleDisconnect(client: Socket)
	{
		if (!client.data.user)
			return;

		const userId = client.data.user.userId;
		const user  = client.data.user;

		if (this.onlineUsers.has(userId))
			this.onlineUsers.get(userId).delete(client.id);

		if (this.onlineUsers.get(userId).size === 0)
		{
			this.onlineUsers.delete(userId);
			this.handleOfflineUser(user);
		}
	}

	private async handleOnlineUser(user : any)
	{
		const friends = await this.socialService.getFriends(user.userId, 'ACCEPT');

		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				username: user.userName,
				status: true
			});
		});
	}

	private async handleOfflineUser(user : any)
	{
		const friends = await this.socialService.getFriends(user.userId, 'ACCEPT');
		
		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				username: user.userName,
				status: false
			});
		});
	}

	public async sendOnlineFriendStatus(@ConnectedSocket() client : Socket)
	{
		const userId = client.data.user.userId;

		const friends = await this.socialService.getFriends(userId, 'ACCEPT');

		const friendStatus = friends.map(friend => {
			const isOnline = this.onlineUsers.has(friend.id);
			return { username: friend.username, status : isOnline ? true : false};
		});

		friendStatus.forEach(user => {
			if (user.status === true)
					this.server.to(`user_${userId}`).emit('user-status', user);
		});
	}

	public newFriendship(user1: any, user2: any)
	{
		if (this.onlineUsers.has(user1.userId))
		{
			this.server.to(`user_${user2.userId}`).emit('user-status', {
				username: user1.username,
				status: true
			});
		}

		if (this.onlineUsers.has(user2.userId))
		{
			this.server.to(`user_${user1.userId}`).emit('user-status', {
			username: user2.username,
			status: true
			});
		}
	}

	public friendshipRemoved(user1: any, user2: any)
	{
		this.server.to(`user_${user2.userId}`).emit('user-status', {
			username: user1.username,
			status: false
		});

		this.server.to(`user_${user1.userId}`).emit('user-status', {
			username: user2.username,
			status: false
		});
	}
}
