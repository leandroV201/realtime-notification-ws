import { Injectable, OnModuleInit } from '@nestjs/common'
import { RedisService } from './redis.service'
import { RealtimeGateway } from '../realtime/realtime.gateway'

@Injectable()
export class RedisSubscriberService implements OnModuleInit {
  constructor(
    private readonly redis: RedisService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    await this.redis.sub.pSubscribe('notifications:user:*', (message, channel) => {
      try {
        const payload = JSON.parse(message)
        const userId = channel.split(':').pop()

        if (!userId) return

        this.realtimeGateway.sendToUser(userId,'notification', payload)

      } catch (err) {
      }
    })

  }
}