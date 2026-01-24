import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { UseGuards } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/wsjwt/wsjwt.guard";
import { ParseUserPipe } from "src/pipes/parseUser.pipe";
import { privateMessageDto } from "src/dto/private-msg.dto";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway
{
	@WebSocketServer() server: Server;

	@SubscribeMessage('chatMessage')
	handleNewMaessage(@MessageBody() message: string, @ConnectedSocket() client: Socket)
	{
		this.server.emit('chatMessage', { message: message,
			username: client.data.user.username, 
			timestamp: new Date()
		});
	}

	@SubscribeMessage('privateMessage')
	handlePrivateMessage(@MessageBody() message: privateMessageDto,
		@MessageBody('target', ParseUserPipe) targetId : any,
			@ConnectedSocket() client: Socket)
	{
		const targetRoom = `user_${targetId}`;
		const senderId = client.data.user.userId;

		this.server.to(targetRoom).emit('privateMessage', {
			fromUsername: senderId,
			message: message,
			timestamp: new Date()
		});

		this.server.to(`user_${senderId}`).emit('privateMessage', {
			from: senderId,
			to: senderId,
			message: message,
			timestamp: new Date()
		});
	}
}