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
import { chatMessageDto } from "src/dto/chat-msg.dto";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway
{
	@WebSocketServer() server: Server;

	@SubscribeMessage('chat-message')
	handleNewMaessage(@MessageBody() message: chatMessageDto,
						@ConnectedSocket() client: Socket)
	{
		this.server.emit('chat-message', {
			message: message.body,
			username: client.data.user.username, 
			timestamp: new Date()
		});
	}

	@SubscribeMessage('private-message')
	handlePrivateMessage(@MessageBody() message: privateMessageDto,
		@MessageBody('target', ParseUserPipe) targetId : any,
			@ConnectedSocket() client: Socket)
	{
		const targetRoom = `user_${targetId}`;
		const senderId = client.data.user.userId;

		this.server.to(targetRoom).emit('private-message', {
			fromUsername: senderId,
			message: message.body,
			timestamp: new Date()
		});

		this.server.to(`user_${senderId}`).emit('private-message', {
			from: senderId,
			to: senderId,
			message: message.body,
			timestamp: new Date()
		});
	}
}