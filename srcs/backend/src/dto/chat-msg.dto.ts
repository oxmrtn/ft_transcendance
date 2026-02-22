import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class chatMessageDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(1600)
	content: string;
}
