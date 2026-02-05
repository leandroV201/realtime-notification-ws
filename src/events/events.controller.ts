import { Body, Controller, Post } from '@nestjs/common'
import { EventsService } from './events.service'

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() body: any) {
    await this.eventsService.publishEvent(body)
    return { ok: true }
  }
}
