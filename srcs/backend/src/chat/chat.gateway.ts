import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { WsJwtGuard } from "src/auth/wsjwt/wsjwt.guard";
import { ParseUserPipe } from "src/pipes/parseUser.pipe";
import { privateMessageDto } from "src/dto/private-msg.dto";
import { chatMessageDto } from "src/dto/chat-msg.dto";

@UseGuards(WsJwtGuard)
@UsePipes(new ValidationPipe ({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway
{
	@WebSocketServer() server: Server;

	@SubscribeMessage('chat-message')
	handleNewMaessage(@MessageBody() message: chatMessageDto, @ConnectedSocket() client: Socket)
	{
		this.server.emit('chat-message', {
			content: message.content,
			sender: client.data.user.username,
			destination: null,
			isPrivate: false,
			isSender: null
		});
	}

	@SubscribeMessage('private-message')
	handlePrivateMessage(@MessageBody() message: privateMessageDto,
		@MessageBody('target', ParseUserPipe) targetId : any,
			@ConnectedSocket() client: Socket)
	{
		const targetRoom = `user_${targetId}`;
		const senderId = client.data.user.userId;
		if (targetId == senderId)
			return;

		const messageObject = {
			content: message.content,
			sender: client.data.user.username,
			destination: message.target,
			isPrivate: true
		};

		this.server.to(targetRoom).emit('private-message', { ...messageObject, isSender: false });
		this.server.to(`user_${senderId}`).emit('private-message', { ...messageObject, isSender: true });
	}
}
