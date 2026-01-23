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

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	handleConnection(client: Socket, server: Server)
	{
		if (!client.data.user)
			return;
		
		client.broadcast.emit('user-joined', {
			message: `${client.data.user.username} joined the chat!`,
		})
	}
 
	handleDisconnect(@ConnectedSocket() client: Socket)
	{
		client.broadcast.emit('user-left', {
			message: `${client.data.user.username} left the chat!`,
		})
	}

	@SubscribeMessage('chatMessage')
	handleNewMaessage(@MessageBody() message: string, @ConnectedSocket() client: Socket)
	{
		this.server.emit('chatMessage', { message: message,
			username: client.data.user.username, 
			timestamp: new Date()
		});
	}
}