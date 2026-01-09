import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class SearchQueryDto
{
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  q: string;
}
