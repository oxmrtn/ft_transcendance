import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async getUserGameHistory(userId: number, page: number, limit: number)
  {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const requestedLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
    const take = Math.min(requestedLimit, 100);
    const skip = (safePage - 1) * take;

    const games = await this.prisma.gameParticipant.findMany({
      where: {
        userId: userId
      },
      include: {
        game: {
          select: {
            id: true,
            finishedAt: true,
            exercise: {
              select: {
                title: true
              }
            },
            _count: {
              select: {
                participants: true
              }
            }
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
      page: safePage,
      total,
      games: games.map(g => ({
        gameId: g.gameId,
        exercise: g.game.exercise.title,
        rank: g.rank,
        players: g.game._count.participants,
        finishedAt: g.game.finishedAt,
        timeTakenMs: g.timeTakenMs
      }))
    };
  }

  async getUserGameDetails(userId: number, gameId: number)
  {
    const mine = await this.prisma.gameParticipant.findUnique({
      where: {
        gameId_userId: {
          gameId,
          userId,
        }
      },
      select: {
        rank: true,
        timeTakenMs: true,
        game: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            finishedAt: true,
            exercise: {
              select: {
                title: true,
              }
            },
            participants: {
              orderBy: {
                rank: 'asc'
              },
              select: {
                rank: true,
                timeTakenMs: true,
                user: {
                  select: {
                    username: true,
                    profilePictureUrl: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!mine)
      return null;

    return {
      gameId,
      exercise: mine.game.exercise.title,
      status: mine.game.status,
      startedAt: mine.game.startedAt,
      finishedAt: mine.game.finishedAt,
      myRank: mine.rank,
      myTimeTakenMs: mine.timeTakenMs,
      players: mine.game.participants.map((p) => ({
        username: p.user.username,
        profilePictureUrl: p.user.profilePictureUrl,
        rank: p.rank,
        timeTakenMs: p.timeTakenMs,
      }))
    };
  }
}