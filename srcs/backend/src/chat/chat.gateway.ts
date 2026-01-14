import {
	MessageBody,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection	
	} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";

// class ChatMessage {
// 	username: string;
// 	message: string;
// }

@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	handleConnection(client: Socket)
	{
		client.broadcast.emit('user-joined', {
			message: `${client.id} joined the chat!`,
		})
	}
 
	handleDisconnect(client: Socket)
	{
		client.broadcast.emit('user-left', {
			message: `${client.id} left the chat!`,
		})
    }

	@SubscribeMessage('newMessage')
	handleNewMaessage(@MessageBody() message: string, client: Socket)
	{
		this.server.emit('message', message, client.id , new Date());
	}
}