import { Body, Controller, Post} from '@nestjs/common'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController
{
    constructor( private authService : AuthService) {}
    
    @Post('register')
    async register (@Body() Body : {email : string; password : string; username : string })
    {
        return this.authService.register(Body.email, Body.password, Body.username);
    }
    
    @Post('login')
    async login (@Body () Body : { email : string, password : string})
    {
        return this.authService.login(Body.email, Body.password);
    }
}