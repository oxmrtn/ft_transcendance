import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaService } from 'prisma/prisma.service'

export interface Challenge {
  id: number
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
        id: true,
        title: true,
        subject: true
      }
    })
  }

  private async ensureLoaded()
  {
    if (this.challenges.length === 0)
      await this.load()
  }

  async getAll(): Promise<Challenge[]>
  {
    await this.ensureLoaded();
    return this.challenges
  }

  async getRandom(): Promise<Challenge>
  {
    await this.ensureLoaded();
    return this.challenges[Math.floor(Math.random() * this.challenges.length)]
  }

  async getByTitle(title: string): Promise<Challenge | undefined>
  {
    await this.ensureLoaded();
    return this.challenges.find(c => c.title === title)
  }
}
