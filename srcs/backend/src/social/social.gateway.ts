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
import { SocialService } from "./social.service";
import { privateMessageDto } from "src/dto/private-msg.dto";
import { ParseUserPipe } from "src/pipes/parseUser.pipe";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class SocialGateway implements OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server;

	constructor(private socialService: SocialService) {}

	private onlineUsers = new Map<number, string>();//voir pour gerer un tableau de string par user

	async handleConnection(@ConnectedSocket() client: Socket)
	{
		if (!client.data.user)
			return;

		await client.join(`user_${client.data.user.userId}`);
		this.onlineUsers.set(client.data.user.userId, client.id);
		this.handleOnlineUser(client);
	}

	handleDisconnect(client: Socket)
	{
		if (!client.data.user)
			return;

		this.onlineUsers.delete(client.data.user.userId);
		this.handleOfflineUser(client);
	}

	@SubscribeMessage('privateMessage')
	handlePrivateMessage(@MessageBody() message: privateMessageDto,
		@MessageBody('target', ParseUserPipe) targetId : any,
			@ConnectedSocket() client: Socket)
	{
		const targetRoom = `user_${targetId}`;

		this.server.to(targetRoom).emit('privateMessage', {
			fromUsername: client.data.user.userId,
			message: message,
			timestamp: new Date()
		});

		this.server.to(`user_${client.data.user.userId}`).emit('privateMessage', {
			from: client.data.user.userId,
			to: client.data.user.userId,
			message: message,
			timestamp: new Date()
		});
	}

	private async handleOnlineUser(@ConnectedSocket() client: Socket)
	{
		const friends = await this.socialService.getFriends(client.data.user.userId, 'ACCEPT');

		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				id: client.data.user.userId,
				status: 'ONLINE'
			});
		});
	}

	private async handleOfflineUser(@ConnectedSocket() client: Socket)
	{
		const friends = await this.socialService.getFriends(client.data.user.userId, 'ACCEPT');
		
		friends.forEach(friend =>
		{
			this.server.to(`user_${friend.id}`).emit('user-status', {
				id: client.data.user.userId,
				status: 'OFFLINE'
			});
		});
	}
}
