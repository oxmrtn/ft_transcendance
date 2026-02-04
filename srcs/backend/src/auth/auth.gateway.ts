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
import { JwtService } from "@nestjs/jwt";

@UseGuards(WsJwtGuard)
@WebSocketGateway({cors: { origin: '*' } })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {

	@WebSocketServer() server: Server;

	constructor(private jwtService: JwtService) {}

	private extractToken(@ConnectedSocket() client: Socket): string | undefined
	{
		const [type, token] = client.handshake.auth.token?.split(' ') ??
			client.handshake.headers.authorization?.split(' ') ??
				[];
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
		}
		catch (error)
		{
			console.log('Authorization failed, disconnection...');
			client.disconnect();
			return;
		}
	}
 
	handleDisconnect(@ConnectedSocket() client: Socket) {}
}