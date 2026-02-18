import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, ConflictException, Injectable, UnsupportedMediaTypeException} from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class ProfileService
{
	constructor (
		private prisma : PrismaService,
		private auth : AuthService,
	){};

	async getProfile(user : string)
	{
		if(!user || (!await this.prisma.user.findUnique({where:{username : user}})))
			throw new BadRequestException("No match found for user name : " + user)

		return	this.prisma.user.findUnique({
				where: {username: user},
				select: { username:true, profilePictureUrl:true, createdAt:true, title:true, xp:true}
			});
	}

	async updateProfile(request :any, body : any,)
	{
		if(!request.user.userId || (!await this.prisma.user.findUnique({where:{id : request.user.userId}})))
			throw new BadRequestException("No match found for userId : " + request.user.userId)
		if (!body)
			throw new BadRequestException("Empty request, no data to  update");
		if(body.picture)
			await this.updatePicture(body.picture, request.user.userId);
		await this.udpateData(request.user.userId, body.username?.value, body.email?.value, body.password?.value)

		const updatedUser = await this.prisma.user.findUnique({
            where: { id: request.user.userId }
        });
        const token = await this.auth.generateToken(
            updatedUser.id, 
            updatedUser.username, 
            updatedUser.email, 
            updatedUser.profilePictureUrl
        );
        return { token };
	}

    async updatePicture(picture : MultipartFile, userId : number)
	{
		if (picture.mimetype !== "image/jpeg" && picture.mimetype !== "image/png")
			throw new UnsupportedMediaTypeException('Profile picture must be jpg or png only.');
		const picPath = `./src/profile/pictures/user_${userId}_avatar.jpg`;
		fs.promises.writeFile(picPath, await picture.toBuffer());
		return await this.prisma.user.update({where: {id: userId}, data: {profilePictureUrl: picPath}});
    }

	async udpateData(userId : number, newUsername?: string, newMail?: string, newPassword?: string )
	{
		const old = (await this.prisma.user.findUnique({where: {id: userId}}));
		if(newUsername)
		{
			if (old.username === newUsername)
				throw new BadRequestException ("New username must be different from the previous one!");
			if (await this.prisma.user.findFirst({where : {username : newUsername}}))
				throw new BadRequestException ("Username already exists !");
			await this.prisma.user.update({where: {id: userId},data: {username: newUsername}});
		}
		if(newMail)
		{
			if (old.email === newMail)
				throw new BadRequestException ("New email must be different from the previous one!");
			if (await this.prisma.user.findFirst({where : {email : newMail}}))
				throw new BadRequestException ("Email already exists !");
			await this.prisma.user.update({where: {id: userId},data: {email: newMail}});
		}
		if(newPassword)
		{
			if (!await bcrypt.compare(newPassword, old.hashedPwd))
				await this.prisma.user.update({where: {id: userId},data: {hashedPwd: await this.auth.hashPassword(newPassword)}});
			else
				throw new BadRequestException ("New password must be different from the previous one!");
		}
	}
}