import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService 
{
    private readonly jwt_secret: string;
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ){
        this.jwt_secret = this.configService.get<string>('JWT_SECRET')
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
        try {
        const user = await this.prisma.user.create({
            data: {email, hashedPwd : hashedpwd, username},
        });
        const token = await this.generateToken(user.id);
        return { token };
    } catch (error)
        {
            // TO DO --- COMMENT GERER PROPREMENT ? 
            throw new ConflictException("User already exist in database !");
        }
    }
    async login(email : string, password : string) : Promise<{token: string}>
    {
    const user = await this.prisma.user.findUnique({ where : { email }});
        if (!user || !(await bcrypt.compare(password, user.hashedPwd)))
            throw new UnauthorizedException('Invalid mail or password');
        const token = await this.generateToken(user.id);
        return { token };
    }

    async validate_token(token : string): Promise<any>
    {
        try {
            return jwt.verify(token, this.jwt_secret);
        } catch (error)
        {
            throw new UnauthorizedException('Invalid token');
        }
    }

    async findOneByUsername(username: string): Promise<any>
    {
        return this.prisma.user.findUnique({ where : { username }});
    }
}
