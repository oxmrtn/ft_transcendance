import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class privateMessageDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(1600)
	body: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	target: string;
}
