import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io';
import { WsException } from '@nestjs/websockets';


@Injectable()
export class WsJwtGuard implements CanActivate
{
	canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean>
	{
		if (context.getType() !== 'ws')
			return true;

		const client: Socket = context.switchToWs().getClient();
		
		if (!client.data.user)
			throw new WsException('session-expired');

		return true;
    }
}