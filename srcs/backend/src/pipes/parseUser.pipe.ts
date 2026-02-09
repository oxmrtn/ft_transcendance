import { PipeTransform, Injectable,
		NotFoundException, ArgumentMetadata, BadRequestException }
	from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class ParseUserPipe implements PipeTransform
{
	constructor(private readonly authService: AuthService) {}

	async transform(value: any, metadata: ArgumentMetadata): Promise<number>
	{
		if(!value)
			throw new BadRequestException();

		const user = await this.authService.findOneByUsername(value);
		if (!user)
			throw new NotFoundException(`User: "${value}" not found`);
		return user.id;
	}
}
