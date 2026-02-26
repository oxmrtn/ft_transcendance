import { ConflictException, Injectable, UnauthorizedException, InternalServerErrorException} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService 
{
    private readonly jwt_secret: any;
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

    async generateToken(userId : number, username : string) : Promise<string>
    {
        return jwt.sign({ userId, username }, this.jwt_secret, {expiresIn: '1h'});
    }

    async register(email : string, password : string, username : string) : Promise<{token: string}>
    {
        const hashedpwd = await this.hashPassword(password);
        try {
            const user = await this.prisma.user.create({
                data: {email, hashedPwd : hashedpwd, username},
            });
            const token = await this.generateToken(user.id, user.username);
            return { token };
        } catch (error)
        {
            if (error instanceof Prisma.PrismaClientKnownRequestError)
            {
                if (error.code === 'P2002')
                {
                    const target = error.meta?.target as string[];
                    if (target.includes('email')) {
                        throw new ConflictException("Seems like you already have an account, login instead?");
                    }
                    if (target.includes('username')) {
                        throw new ConflictException("This username is already taken, choose another one!");
                }
            }
        }
        throw new InternalServerErrorException("Unexpected error while creating account!");

        }
    }

    async login(email : string, password : string) : Promise<{token: string}>
    {
        const user = await this.prisma.user.findUnique({ where : { email }});
        if (!user)
            throw new UnauthorizedException('Invalid credential');
        if (!(await bcrypt.compare(password, user.hashedPwd)))
            throw new UnauthorizedException('Invalid credential');
        const token = await this.generateToken(user.id, user.username);
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

