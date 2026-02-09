import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { createClient, RedisClientType } from 'redis'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  private client : RedisClientType;

  constructor(){}


  async onModuleInit() {
    
    const url = process.env.REDIS_URL || 'redis://localhost:6379'

    this.client    = createClient({ url })
    this.pubClient = createClient({ url })
    this.subClient = createClient({ url })

    this.client.on('error', (err) => console.log('Redis CLIENT error', err))
    this.pubClient.on('error', (err) => console.log('Redis PUB error', err))
    this.subClient.on('error', (err) => console.log('Redis SUB error', err))

    await Promise.all([
      this.client.connect(),
      this.pubClient.connect(),
      this.subClient.connect(),
    ])

    console.log('Redis connected (client + pub/sub)')
  }

  async onModuleDestroy() {
     await Promise.all([
      this.client?.quit(),
      this.pubClient?.quit(),
      this.subClient?.quit(),
    ])
  }

  get pub() {
    return this.pubClient
  }

  get sub() {
    return this.subClient
  }

  async setRefreshToken(token: string, userId: string, ttlSeconds: number) {
    const key = `refresh_token:${token}`
    await this.client.set(key, userId, { EX: ttlSeconds })
  }

  async getRefreshToken(token: string): Promise<string | null> {
    const key = `refresh_token:${token}`
    return await this.client.get(key)
  }

  async deleteRefreshToken(token: string) {
    const key = `refresh_token:${token}`
    await this.client.del(key)
  }
}
