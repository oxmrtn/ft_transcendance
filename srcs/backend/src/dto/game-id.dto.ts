import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class gameIdDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	gameId: string;
}