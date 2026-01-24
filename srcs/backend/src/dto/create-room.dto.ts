import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max } from 'class-validator';

export class createRoomDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	gameId: string;

	@IsInt()
	@Min(2)
	@Max(4)
	playerNb: number;
}