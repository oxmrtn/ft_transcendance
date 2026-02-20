import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class privateMessageDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(1600)
	content: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	target: string;
}
