import { IsString, IsNotEmpty, MaxLength, IsInt, Min, Max } from 'class-validator';

export class createRoomDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	gameId: string;
//Min et Max ne fonctionnent pas
	@IsInt()
	@Min(2)
	@Max(4)
	playerNumber: number;
}