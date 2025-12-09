import { PrismaService } from './prisma.service';
export declare class AppController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getHello(): string;
    testDbConnection(): Promise<{
        status: string;
        message: string;
        testUser: string;
        totalUsers: number;
        error?: undefined;
    } | {
        status: string;
        message: string;
        error: any;
        testUser?: undefined;
        totalUsers?: undefined;
    }>;
}
