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
import { JwtService } from "@nestjs/jwt";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	constructor(private jwtService: JwtService) {}

	private extractToken(@ConnectedSocket() client: Socket): string | undefined
	{
		//const [type, token] = client.handshake.auth.token?.split(' ') ?? [];
		const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];//version Postman ou je fais passer le tkn dans un header
		return type === 'Bearer' ? token : undefined;
	}

	handleConnection(client: Socket, server: Server)
	{
		try
		{
			const token = this.extractToken(client);

			if (!token)
				throw new Error('No token received');

			const payload = this.jwtService.verify(token, {
				secret: process.env.JWT_SECRET
			});

			client.data.user = payload; 
			//console.log(`Client connected : ${client.id}, userName: ${payload.username}`);
		}
		catch (e)
		{
			console.log('Authorization failed, disconnection...');
			client.disconnect();
		}
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

	@SubscribeMessage('newMessage')
	handleNewMaessage(@MessageBody() message: string, @ConnectedSocket() client: Socket)
	{
		this.server.emit('newMessage', message, client.data.user, new Date());
	}

	@SubscribeMessage('events')
	handleEvent(@MessageBody() data: string, @ConnectedSocket() client: Socket)
	{
		return `Event from user: ${client.data.username}`;
	}
}