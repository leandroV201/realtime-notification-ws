import { Controller, Get, Query, Patch, Param, Delete, UseGuards, Req } from "@nestjs/common"
import { NotificationsService } from "./notifications.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { Request } from "express"

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Req() req: Request,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const userId = req['user'].sub;
    return this.notificationsService.list(
      userId,
      Number(page),
      Number(limit),
    )
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  async unreadCount(@Req() req: Request) {
    const userId = req['user'].sub;
    return this.notificationsService.unreadCount(userId)
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const userId = req['user'].sub;
    return this.notificationsService.markAsRead(userId, id)
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  async markAllAsRead(@Req() req: Request) {
    const userId = req['user'].sub;
    return this.notificationsService.markAllAsRead(userId)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const userId = req['user'].sub;
    return this.notificationsService.remove(userId, id)
  }
}

