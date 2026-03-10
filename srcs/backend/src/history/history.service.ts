import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getUserGameHistory(userId: number, page: number)
  {
    const take = 10;
    const skip = (page - 1) * take;

    const games = await this.prisma.gameParticipant.findMany({
      where: {
        userId: userId
      },
      include: {
        game: {
          include: {
            exercise: true,
            participants: true
          }
        }
      },
      orderBy: {
        game: {
          finishedAt: 'desc'
        }
      },
      take,
      skip
    });

    const total = await this.prisma.gameParticipant.count({
      where: { userId }
    });

    return {
      page,
      total,
      games: games.map(g => ({
        gameId: g.gameId,
        exercise: g.game.exercise.title,
        rank: g.rank,
        players: g.game.participants.length,
        finishedAt: g.game.finishedAt
      }))
    };
  }
}