import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'

import { NotificationsService } from './notifications.service'

@ApiTags('Notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  // =========================================
  // TOUTES MES NOTIFICATIONS
  // =========================================

  @Get()
  @ApiOperation({
    summary:
      'Voir mes notifications',
  })
  getMyNotifications(
    @Req() req: any,
  ) {
    return this.notificationsService.getMyNotifications(
      req.user.userId,
    )
  }

  // =========================================
  // NOTIFICATIONS NON LUES
  // =========================================

  @Get('non-lues')
  @ApiOperation({
    summary:
      'Voir mes notifications non lues',
  })
  getUnreadNotifications(
    @Req() req: any,
  ) {
    return this.notificationsService.getUnreadNotifications(
      req.user.userId,
    )
  }

  // =========================================
  // NOMBRE DE NOTIFICATIONS NON LUES
  // =========================================

  @Get('non-lues/count')
  @ApiOperation({
    summary:
      'Compter mes notifications non lues',
  })
  getUnreadCount(
    @Req() req: any,
  ) {
    return this.notificationsService.getUnreadCount(
      req.user.userId,
    )
  }

  // =========================================
  // TOUT MARQUER COMME LU
  // =========================================

  @Patch('toutes/lues')
  @ApiOperation({
    summary:
      'Marquer toutes les notifications comme lues',
  })
  markAllAsRead(
    @Req() req: any,
  ) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    )
  }

  // =========================================
  // UNE NOTIFICATION COMME LUE
  // =========================================

  @Patch(':id/lue')
  @ApiOperation({
    summary:
      'Marquer une notification comme lue',
  })
  markAsRead(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Req() req: any,
  ) {
    return this.notificationsService.markAsRead(
      id,
      req.user.userId,
    )
  }
}