import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class codeSubmitDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	gameId: string;

	@IsString()
	@IsNotEmpty()
	@MaxLength(1600)
	body: string;
}
