import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

interface notification {
    userid: UUID;
    title: string;
    message: string;
    level: string;
    createdAt: Date;
}

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async list(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit

        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.notification.count({
                where: { userId },
            }),
        ])

        return { items, total, page, limit }
    }

    async unreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, readAt: null },
        })

        return { count }
    }

    async createNotification(notification: notification) {
        await this.prisma.notification.create({
            data: {
                userId: notification.userid,
                title: notification.title,
                message: notification.message,
                type: notification.level
            }
        })
    }

    async markAsRead(userId: string, id: string) {
        return this.prisma.notification.update({
            where: { id, userId },
            data: { readAt: new Date() },
        })
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        })

        return { ok: true }
    }

    async remove(userId: string, id: string) {
        await this.prisma.notification.delete({
            where: { id, userId },
        })

        return { ok: true }
    }
}
