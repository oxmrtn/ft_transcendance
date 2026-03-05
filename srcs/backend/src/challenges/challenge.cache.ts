import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'

export interface Challenge {
  title: string
  subject: string
}

@Injectable()
export class ChallengeCache implements OnModuleInit {
  private challenges: Challenge[] = []

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.load()
  }

  async load() {
    this.challenges = await this.prisma.exercise.findMany({
      select: {
        title: true,
        subject: true
      }
    })
  }

  getAll(): Challenge[] {
    return this.challenges
  }

  getRandom(): Challenge {
    return this.challenges[Math.floor(Math.random() * this.challenges.length)]
  }

  getByTitle(title: string): Challenge | undefined {
    return this.challenges.find(c => c.title === title)
  }
}
