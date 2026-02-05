import { Module } from '@nestjs/common';
import { KafkaConsumerService } from './kafka-consumer.service';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [KafkaConsumerService],
  exports: [KafkaConsumerService]
})
export class KafkaModule {}
