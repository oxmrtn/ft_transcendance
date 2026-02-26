import { Body, Controller, Post} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto } from 'src/dto/auth-login.dto';
import { RegisterDto } from 'src/dto/auth-register.dto';


@Controller('auth')
export class AuthController
{
    constructor( private authService : AuthService) {}
    
    @Post('register')
    async register (@Body() registerDto : RegisterDto)
    {
        return this.authService.register(registerDto.email, registerDto.password, registerDto.username);
    }
    
    @Post('login')
    async login (@Body() loginDto : LoginDto)
    {
        return this.authService.login(loginDto.email, loginDto.password);
    }
}
