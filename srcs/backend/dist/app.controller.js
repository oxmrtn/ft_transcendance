"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let AppController = class AppController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getHello() {
        return 'Backend is running. Check /test-db for database status.';
    }
    async testDbConnection() {
        try {
            const testUser = await this.prisma.user.upsert({
                where: { email: 'test@example.com' },
                update: { username: 'test_user_ok' },
                create: {
                    username: 'test_user_ok',
                    email: 'test@example.com',
                    wallet: 0,
                    xp: 0
                },
            });
            const userCount = await this.prisma.user.count();
            return {
                status: 'OK',
                message: `Prisma & PostgreSQL are connected and working!`,
                testUser: testUser.email,
                totalUsers: userCount,
            };
        }
        catch (error) {
            console.error('❌ Database Test Failed:', error);
            return {
                status: 'ERROR',
                message: 'Prisma/Database Connection Failed.',
                error: error.message,
            };
        }
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('test-db'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "testDbConnection", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AppController);
//# sourceMappingURL=app.controller.js.map