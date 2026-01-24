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

		if (!this.onlineUsers.has(userId))
			this.onlineUsers.set(userId, new Set());

		this.onlineUsers.get(userId).add(client.id);

		if (this.onlineUsers.get(userId).size === 1)
			await this.handleOnlineUser(userId);

		await this.sendOnlineFriendStatus(client);

		await client.join(`user_${userId}`);
	}

	handleDisconnect(client: Socket)
	{
		if (!client.data.user)
			return;

		const userId = client.data.user.userId;

		if (this.onlineUsers.has(userId))
			this.onlineUsers.get(userId).delete(client.id);

		if (this.onlineUsers.get(userId).size === 0)
		{
			this.onlineUsers.delete(userId);
			this.handleOfflineUser(userId);
		}
	}

	private async handleOnlineUser(userId : number)
	{
		const friends = await this.socialService.getFriends(userId, 'ACCEPT');

		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				id: userId,
				status: 'ONLINE'
			});
		});
	}

	private async handleOfflineUser(userId : number)
	{
		const friends = await this.socialService.getFriends(userId, 'ACCEPT');
		
		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				id: userId,
				status: 'OFFLINE'
			});
		});
	}

	private async sendOnlineFriendStatus(@ConnectedSocket() client : Socket)
	{
		const userId = client.data.user.userId;

		const friends = await this.socialService.getFriends(userId, 'ACCEPT');

		const friendStatus = friends.map(friend => {
			const isOnline = this.onlineUsers.has(friend.id);
			return { id: friend.id, status : isOnline ? 'ONLINE' : 'OFFLINE'};
		});

		friendStatus.forEach(user => {
			if (user.status === 'ONLINE')
					client.emit('user-status', user);
		});
	}
}
