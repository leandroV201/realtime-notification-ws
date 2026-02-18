import { Injectable, OnModuleInit } from '@nestjs/common'
import { Kafka } from 'kafkajs'

@Injectable()
export class EventsService implements OnModuleInit {
  private producer: any

  async onModuleInit() {
    const broker = process.env.KAFKA_BROKER || 'redis:9092'

    const kafka = new Kafka({
      clientId: 'api',
      brokers: [broker],
    })

    this.producer = kafka.producer()
    await this.producer.connect()
  }

  async publishEvent(payload: any) {
    await this.producer.send({
      topic: 'app.events',
      messages: [
        {
          key: payload.userId || null,
          value: JSON.stringify(payload),
        },
      ],
    })
  }
}
