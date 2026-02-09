import {IsEmail, IsNotEmpty, MinLength} from 'class-validator'
import {Transform} from 'class-transformer'

export class RegisterDto {
    @IsNotEmpty({message: 'Email is mandatory to register'})
    @IsEmail({}, {message: 'Invalid email format'})
    @Transform(({ value }) => typeof value === 'string' ? value.toLocaleLowerCase() : value)
    email: string;

    @IsNotEmpty({message: 'Password is mandatory to register'})
    @MinLength(8, {message: 'Password must be at least 8 characters long'})
    password: string;

    @IsNotEmpty({message: 'Username is mandatory to register'})
    username: string;
}

