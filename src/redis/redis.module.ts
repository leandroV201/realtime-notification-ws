import { Module } from '@nestjs/common'
import { RedisService } from './redis.service'
import { RedisSubscriberService } from './redis-subscriber.service'
import { RealtimeModule } from '../realtime/realtime.module'

@Module({
  imports: [RealtimeModule],
  providers: [RedisService, RedisSubscriberService],
  exports: [RedisService],
})
export class RedisModule {}
