import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs'
import { PrismaService } from '../prisma/prisma.service'
import { RedisService } from '../redis/redis.service'

interface KafkaEvent {
  userId: string
  type: string
  title: string
  message: string
  data?: any
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    const broker = process.env.KAFKA_BROKER || 'redpanda:29092'

    const kafka = new Kafka({
      clientId: 'notification-consumer',
      brokers: [broker],
    })

    this.consumer = kafka.consumer({
      groupId: 'notification-group',
    })

    await this.consumer.connect()

    await this.consumer.subscribe({
      topic: 'app.events',
    })

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload)
      },
    })

  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect()
    }
  }

  private async handleMessage({ message }: EachMessagePayload) {
    try {
      const value = message.value?.toString()
      if (!value) return

      const event: KafkaEvent = JSON.parse(value)


      if (!event.userId || !event.type || !event.title || !event.message) {
        return
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: event.userId,
          type: event.type,
          title: event.title,
          message: event.message,
          data: event.data || {},
        },
      })


      const channel = `notifications:user:${event.userId}`
      const payload = JSON.stringify({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        readAt: notification.readAt,
        createdAt: notification.createdAt.toISOString(),
      })

      await this.redis.pub.publish(channel, payload)

    } catch (error) {
    }
  }
}