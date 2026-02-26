import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength } from 'class-validator';

export class RegisterDto
{
    @IsString()
    @IsNotEmpty({message: 'Username cannot be empty !'})
    @MinLength(2, {message: 'Username must be at least 8 character long !'})
    username : string;


    @IsString()
    @IsNotEmpty( {message: 'Email cannot be empty !'})
    @MaxLength(80, {message: 'Email is too long !'})
    @IsEmail({}, { message: 'Email adress is not valid' })
    email : string;

    @IsString()
    @IsNotEmpty({message: 'Password cannot be empty !'})
    @MinLength(8, {message: 'Password must be at least 8 character long !'})
    password : string ;
}

