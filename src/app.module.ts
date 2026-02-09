import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { RealtimeModule } from './realtime/realtime.module';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestController } from './test/test.controller';
import { KafkaModule } from './kafka/kafka.module';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: './env' }), RealtimeModule, RedisModule, EventsModule, NotificationsModule, PrismaModule, KafkaModule, AuthModule, UsersModule],
  controllers: [AppController, TestController, AuthController],
  providers: [AppService],
})
export class AppModule { }
