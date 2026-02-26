import { IsString, MaxLength, IsOptional } from 'class-validator';

export class StartGameDto {
	@IsOptional()
	@IsString()
	@MaxLength(100)
	challengeName?: string;
}
