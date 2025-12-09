import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    // Se connecte automatiquement à la BDD au démarrage de l'application
    await this.$connect();
  }

  // Optionnel : Ajout d'une fonction pour fermer la connexion lors de l'arrêt (utile pour les tests ou les arrêts propres)
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}

