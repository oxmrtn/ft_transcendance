import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class KickPlayerDto {
	@IsString()
	@IsNotEmpty()
	@MaxLength(100)
	targetUsername: string;
}
