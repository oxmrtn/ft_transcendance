import { MultipartFile } from '@fastify/multipart';
import { BadRequestException, ConflictException, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import * as bcrypt from 'bcrypt'
import { buffer } from 'stream/consumers';

@Injectable()
export class ProfileService {
	constructor(
		private prisma: PrismaService,
		private auth: AuthService,
	) { };

	async getMyProfile(request: any) {
		if (!request.user.userId || (!await this.prisma.user.findUnique({ where: { id: request.user.userId } })))
			throw new BadRequestException("No match found for userId : " + request.user.userId)

		return this.prisma.user.findUnique({
			where: { id: request.user.userId },
			select: { username: true, email: true, profilePictureUrl: true }
		});
	}

	async updateProfile(request: any, body: any,) {
		if (!request.user.userId || (!await this.prisma.user.findUnique({ where: { id: request.user.userId } })))
			throw new BadRequestException("No match found for userId : " + request.user.userId)
		if (!body)
			throw new BadRequestException("Empty request, no data to  update");
		if (body.picture)
			await this.updatePicture(body.picture, request.user.userId);

		await this.udpateData(request.user.userId, body.username?.value, body.email?.value, body.password?.value)
		const updatedUser = await this.prisma.user.findUnique({
			where: { id: request.user.userId },
			select: { username: true, email: true, profilePictureUrl: true }
		});

		return updatedUser;
	}

	async updatePicture(picture: MultipartFile, userId: number) {
		if (picture.mimetype !== "image/jpeg" && picture.mimetype !== "image/png")
			throw new UnsupportedMediaTypeException('Profile picture must be jpg or png only.');
		const buffer = await picture.toBuffer();
		await this.checkMagicBytes(buffer, picture.mimetype);
		const picPath = `/pictures/${userId}_avatar.jpg`;
		fs.promises.writeFile(`.${picPath}`, buffer);
		return await this.prisma.user.update({ where: { id: userId }, data: { profilePictureUrl: picPath } });
	}

	async checkMagicBytes(Buffer : Buffer<ArrayBufferLike>, mimetype : string)
	{
		if (mimetype === "image/png" && Buffer.length >= 8 && 
			Buffer[0]=== 0x89 &&
			Buffer[1]=== 0x50 && 
			Buffer[2]=== 0x4E &&
			Buffer[3]=== 0x47 &&
			Buffer[4]=== 0x0D &&
			Buffer[5]=== 0x0A &&
			Buffer[6]=== 0x1A &&
			Buffer[7]=== 0x0A)
			return ;
		else if (mimetype === "image/jpeg" && Buffer.length >= 3 &&
			Buffer[0]=== 0xFF &&
			Buffer[1]=== 0xD8 && 
			Buffer[2]=== 0xFF)
			return;
		throw new UnsupportedMediaTypeException('File signature does not match its mimetype !');
	}

	async udpateData(userId: number, newUsername?: string, newMail?: string, newPassword?: string) {
		const old = (await this.prisma.user.findUnique({ where: { id: userId } }));
		if (newUsername) {
			if (old.username === newUsername)
				throw new BadRequestException("New username must be different from the previous one!");
			if (await this.prisma.user.findFirst({ where: { username: newUsername } }))
				throw new BadRequestException("Username already exists !");
			await this.prisma.user.update({ where: { id: userId }, data: { username: newUsername } });
		}
		if (newMail) {
			if (old.email === newMail)
				throw new BadRequestException("New email must be different from the previous one!");
			if (await this.prisma.user.findFirst({ where: { email: newMail } }))
				throw new BadRequestException("Email already exists !");
			await this.prisma.user.update({ where: { id: userId }, data: { email: newMail } });
		}
		if (newPassword) {
			if (!await bcrypt.compare(newPassword, old.hashedPwd))
				await this.prisma.user.update({ where: { id: userId }, data: { hashedPwd: await this.auth.hashPassword(newPassword) } });
			else
				throw new BadRequestException("New password must be different from the previous one!");
		}
	}
}