import { Body, Controller, Post } from '@nestjs/common'
import { RedisService } from '../redis/redis.service'
import { randomUUID } from 'crypto'
import { NotificationsService } from 'src/notifications/notifications.service'

@Controller('test')
export class TestController {
  constructor(private readonly redis: RedisService) {}

  @Post('notify')
  async notify(@Body() body: { userId: string }) {
    const payload = {
      id: randomUUID(),
      title: 'Notificação de teste',
      message: 'Chegou via Redis PubSub + WebSocket',
      level: 'info',
      createdAt: new Date().toISOString(),
    }

    await this.redis.pub.publish(
      `notifications:user:${body.userId}`,
      JSON.stringify(payload),
    )

    return { ok: true, payload }
  }
}
