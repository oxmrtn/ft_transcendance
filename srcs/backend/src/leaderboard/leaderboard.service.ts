import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class LeaderboardService {

	constructor(private prisma: PrismaService) {}

	async getLeaderboard(page: number)
    {

		const pageSize = 10;

		const users = await this.prisma.user.findMany({
			orderBy: {
				xp: 'desc'
			},
			skip: (page - 1) * pageSize,
			take: pageSize,
			select: {
				id: true,
				username: true,
				profilePictureUrl: true,
				xp: true
			}
		});

		return users;
	}

	async getMyRank(userId: number)
    {

		const me = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { xp: true }
		});

		const rank = await this.prisma.user.count({
			where: {
				xp: {
					gt: me.xp
				}
			}
		}) + 1;

		return {
			rank,
			xp: me.xp
		};
	}

	async getAroundMe(userId: number)
    {

		const me = await this.prisma.user.findUnique({
			where: { id: userId },
			select: { xp: true }
		});

		const rank = await this.prisma.user.count({
			where: {
				xp: { gt: me.xp }
			}
		}) + 1;

		const start = Math.max(rank - 5, 0);

		const players = await this.prisma.user.findMany({
			orderBy: {
				xp: 'desc'
			},
			skip: start,
			take: 10,
			select: {
				username: true,
				xp: true,
				profilePictureUrl: true
			}
		});

		return {
			rank,
			players
		};
	}
}
