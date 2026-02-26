import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength } from 'class-validator';

export class LoginDto
{
    @IsString()
    @IsNotEmpty( {message: 'Email cannot be empty !\n'})
    @MaxLength(80, {message: 'Email is too long !\n'})
    @IsEmail({}, { message: 'Email adress is not valid\n' })
    email : string;

    @IsString()
    @IsNotEmpty({message: 'Password cannot be empty !\n'})
    @MinLength(8, {message: 'Password must be at least 8 character long !\n'})
    password : string ;
}

