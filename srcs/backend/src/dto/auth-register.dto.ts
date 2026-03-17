import { IsString, IsNotEmpty, MaxLength, IsEmail, MinLength, Matches} from 'class-validator';
import { Transform } from 'class-transformer';



export class RegisterDto
{
    @IsString()
    @IsNotEmpty({message: 'Username cannot be empty !'})
    @MinLength(2, {message: 'Username must be at least 2 character long !'})
    @MaxLength(12, {message: 'Username must be at maximum 12 character long !'})
    @Matches(/^[a-zA-Z0-9-_]+$/, { 
        message: 'Username can only contain letters, numbers, hyphens and underscores' 
    })
    username : string;


    @IsString()
    @IsNotEmpty( {message: 'Email cannot be empty !'})
    @MaxLength(80, {message: 'Email is too long !'})
    @IsEmail({}, { message: 'Email adress is not valid' })
    @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase() : value)
    email : string;

    @IsString()
    @IsNotEmpty({message: 'Password cannot be empty !'})
    @MinLength(8, {message: 'Password must be at least 8 character long !'})
    password : string ;
}

