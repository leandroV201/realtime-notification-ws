import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getAllUsers() {
        return await this.prisma.user.findMany({ omit: { password: true } });
    }
}
