import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable
export class AuthService 
{
    private readonly jwt_secret: string;
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ){
        this.jwt_secret = this.configService().get<string>('JWT_SECRET')
        if (!this.jwt_secret) {
            throw new Error('JWT_SECRET is not defined in the environment variables.');
    }
    }

    async hashPassword(password : string) : Promise<string>
    {
        const salt = await bcrypt.genSalt();
        return bcrypt.hash(password, salt);
    }

    async generateToken(userId : number) : Promise<string>
    {
        return jwt.sign({ userId }, this.jwt_secret, {expiresIn: '1h'});
    }

    async register(email : string, password : string, username : string) : Promise<{token: string}>
    {
        const hashedpwd = await this.hashPassword(password);
        
        return 
    }
}