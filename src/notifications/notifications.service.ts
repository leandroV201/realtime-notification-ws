import { Injectable } from '@nestjs/common';
import { UUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

interface notification {
    userid: UUID;
    title: string;
    message: string;
    level: string;
    createdAt: Date;
}

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService, private redis: RedisService) { }

    async list(userId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit
        const maxLimit = Math.min(limit, 50);

        const [items, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                select: {
                    id: true,
                    type: true,
                    title: true,
                    message: true,
                    data: true,
                    readAt: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: maxLimit,
            }),
            this.prisma.notification.count({
                where: { userId },
            }),
        ])

        return { items, total, page, limit: maxLimit }
    }

    async unreadCount(userId: string) {
        
        let count = await this.redis.getUnreadCountCache(userId);

        
        if (count === null) {
            count = await this.prisma.notification.count({
                where: { userId, readAt: null },
            });

            
            await this.redis.cacheUnreadCount(userId, count, 300);
        }

        return { count };
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
        const result = await this.prisma.notification.update({
            where: { id, userId },
            data: { readAt: new Date() },
        });

        
        await this.redis.invalidateUnreadCountCache(userId);

        return result;
    }

    async markAllAsRead(userId: string) {
        await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        })

        
        await this.redis.invalidateUnreadCountCache(userId);

        return { ok: true }
    }

    async remove(userId: string, id: string) {
        await this.prisma.notification.delete({
            where: { id, userId },
        })

        
        await this.redis.invalidateUnreadCountCache(userId);

        return { ok: true }
    }
}
