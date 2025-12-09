import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return 'Backend is running. Check /test-db for database status.';
  }

  @Get('test-db')
  async testDbConnection() {
    try {
      // 2. Tenter de créer un utilisateur de test
      // Nous utilisons upsert pour s'assurer que l'utilisateur de test existe,
      // sans causer d'erreur si l'entrée existe déjà.
      const testUser = await this.prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: { username: 'test_user_ok' },
        create: {
          username: 'test_user_ok',
          email: 'test@example.com',
          wallet: 0, // Assurez-vous d'inclure les champs requis (non-null)
          xp: 0
          // Ne pas inclure de champs optionnels si non nécessaires
        },
      });

      const userCount = await this.prisma.user.count();

      return {
        status: 'OK',
        message: `Prisma & PostgreSQL are connected and working!`,
        testUser: testUser.email,
        totalUsers: userCount,
      };
    } catch (error) {
      console.error('❌ Database Test Failed:', error);
      return {
        status: 'ERROR',
        message: 'Prisma/Database Connection Failed.',
        error: error.message,
      };
    }
  }
}