import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private pubClient: RedisClientType
  private subClient: RedisClientType

  async onModuleInit() {
    const url = process.env.REDIS_URL || 'redis://localhost:6379'

    this.pubClient = createClient({ url })
    this.subClient = createClient({ url })

    this.pubClient.on('error', (err) => console.log('Redis PUB error', err))
    this.subClient.on('error', (err) => console.log('Redis SUB error', err))

    await this.pubClient.connect()
    await this.subClient.connect()

    console.log('Redis connected (pub/sub)')
  }

  async onModuleDestroy() {
    await this.pubClient?.quit()
    await this.subClient?.quit()
  }

  get pub() {
    return this.pubClient
  }

  get sub() {
    return this.subClient
  }
}
