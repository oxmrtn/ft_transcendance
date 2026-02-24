import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class codeSubmitDto
{
	@IsString()
	@IsNotEmpty()
	@MaxLength(1600)
	code: string;
}
