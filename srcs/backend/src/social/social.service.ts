import { Injectable,
		BadRequestException, NotFoundException,
		ForbiddenException, ConflictException
	} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';


@Injectable()
export class SocialService
{
	constructor(private prisma: PrismaService) {}

	async checkUser(userId: number)
	{
		const res = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!res)
			throw new NotFoundException(`User ${userId} not found`);
	}


	async searchUsers(query: string)
	{
		if (!query || query.length < 2)
			return [];
		return this.prisma.user.findMany({
			where: { username: { contains: query, mode: 'insensitive' }, },
			select: { id: true, username: true, profilePictureUrl: true },
		});
	}


	async getFriends(userId: number, status: string)
	{
		await this.checkUser(userId);

		const friendships = await this.prisma.friendship.findMany({
			where: {
				OR: [{userId1: userId }, { userId2: userId}],
				status: status,
			},
			select: {
				userId1: true,
				user1: {
					select: {
						id: true,
						username: true,
						profilePictureUrl: true,
						title: true,
						xp: true,
					},
				},
				user2: {
					select: {
						id: true,
						username: true,
						profilePictureUrl: true,
						title: true,
						xp: true,
					},
				},
			 },
		});

		return friendships.map((f) => (f.userId1 === userId ? f.user2 : f.user1));
	}

	async sendFriendRequest(senderId: number, receiverId: number)
	{
		await this.checkUser(senderId);
		await this.checkUser(receiverId);

		if (senderId === receiverId)
			throw new BadRequestException("Self-friendship --> logic Error");
		const [id1, id2] = [senderId, receiverId].sort((a,b) => a - b);
		
		const friendship = await this.prisma.friendship.findUnique({
			where: {
				userId1_userId2: {userId1: id1, userId2: id2,},
			},
		});

		if (friendship && friendship.status === 'ACCEPT')
			throw new ConflictException('Already friend with this user');
		else if (friendship && friendship.status === 'PENDING')
			throw new ConflictException ('Friendship request already exist with this user');

		return this.prisma.friendship.create({
			data: {
				userId1: id1,
				userId2: id2,
				sender: senderId,
				status: 'PENDING'
			},
		});
	}

	async handleRequest(userId: number, friendId: number, accept: boolean)
	{
		const [id1, id2] = [userId, friendId].sort((a, b) => a - b);
		
		const friendship = await this.prisma.friendship.findUnique({
			where: { userId1_userId2: {userId1: id1, userId2: id2 }, },
		});
		
		if (!friendship || friendship.status !== 'PENDING')
			throw new BadRequestException('No pending friendship found between users');

		if (friendship.sender === userId)
			throw new ForbiddenException('Sender cannot accept the friend request');

		if (!accept)
		{
			return this.prisma.friendship.delete({
				where: {userId1_userId2: {userId1: id1, userId2: id2}},
			});
		}
		return this.prisma.friendship.update({
			where: {userId1_userId2: {userId1: id1, userId2: id2}},
			data: {status: 'ACCEPT'},
		});
	}

	async removeFriend(userId: number, friendId: number)
	{
		const [id1, id2] = [userId, friendId].sort((a, b) => a - b);
		
		const friendship = await this.prisma.friendship.findUnique({
			where: {
				userId1_userId2: {userId1: id1, userId2: id2 }, },
		});

		if (!friendship)
			throw new NotFoundException('Friendship not found');
		if (friendship.status !== 'ACCEPT')
			throw new BadRequestException(`Friendship is not accepted (current status: ${friendship.status})`,);

		return this.prisma.friendship.delete({
			where: { userId1_userId2: {userId1: id1, userId2: id2}},
		});
	}
}