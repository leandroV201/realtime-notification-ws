import { Controller, Get, Query, Patch, Param, Delete } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @Query('userId') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.notificationsService.list(
      userId,
      Number(page),
      Number(limit),
    )
  }

  @Get('unread-count')
  async unreadCount(@Query('userId') userId: string) {
    return this.notificationsService.unreadCount(userId)
  }

  @Patch(':id/read')
  async markAsRead(
    @Query('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(userId, id)
  }

  @Patch('read-all')
  async markAllAsRead(@Query('userId') userId: string) {
    return this.notificationsService.markAllAsRead(userId)
  }

  @Delete(':id')
  async remove(
    @Query('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.remove(userId, id)
  }
}

