import {IsEmail, IsNotEmpty, MinLength} from 'class-validator'
import {Transform} from 'class-transformer'

export class LoginDto {
    @IsNotEmpty({message: 'Email is mandatory to login'})
    @IsEmail({}, {message: 'Invalid email format'})
    @Transform(({ value }) => typeof value === 'string' ? value.toLocaleLowerCase() : value)
    email: string;

    @IsNotEmpty({message: 'Password is mandatory to login'})
    @MinLength(8, {message: 'Password must be at least 8 characters long'})
    password: string;
}
