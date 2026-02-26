import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common'
import { EventsService } from './events.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { Request } from 'express'

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createEvent(@Body() body: any, @Req() req: Request) {
    const userId = req['user'].sub
    await this.eventsService.publishEvent({ ...body, userId })
    return { ok: true }
  }
}


