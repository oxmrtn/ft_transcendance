import { IsInt, Min } from 'class-validator';

export class IdParamDto
{
	@IsInt()
	@Min(1)
	id: number;
}
