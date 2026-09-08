import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { ReclamationsService } from './reclamations.service'

import { CreateReclamationDto } from './dto/create-reclamation.dto'
import { UpdateReclamationDto } from './dto/update-reclamation.dto'

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../guards/roles/roles.guard'
import { Roles } from '../roles/roles.decorator'

@ApiTags('Reclamations')
@ApiBearerAuth('access-token')
@Controller('reclamations')
export class ReclamationsController {
  constructor(
    private readonly reclamationsService: ReclamationsService,
  ) {}

  // =========================================
  // ADMIN / AGENT
  // Toutes les réclamations
  // =========================================

  @Get()
  @ApiOperation({
    summary: 'Liste toutes les réclamations',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'AGENT')
  getAll() {
    return this.reclamationsService.getAll()
  }

  // =========================================
  // ADMIN / AGENT
  // Statistiques
  // =========================================

  @Get('statistiques')
  @ApiOperation({
    summary: 'Statistiques des réclamations',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'AGENT')
  getStatistiques() {
    return this.reclamationsService.getStatistiques()
  }

  // =========================================
  // CITOYEN
  // Mes réclamations
  // =========================================

  @Get('mes')
  @ApiOperation({
    summary: 'Voir mes réclamations',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('CITOYEN')
  getMyReclamations(
    @Req() req: any,
  ) {
    return this.reclamationsService.getMyReclamations(
      req.user.userId,
    )
  }

  // =========================================
  // DETAIL D'UNE RECLAMATION
  // =========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Afficher une réclamation',
  })
  @UseGuards(JwtAuthGuard)
  getOne(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.reclamationsService.getOne(
      Number(id),
      req.user.userId,
      req.user.role,
    )
  }

  // =========================================
  // CREATION
  // =========================================

  @Post()
  @ApiOperation({
    summary: 'Créer une réclamation avec analyse IA',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('CITOYEN', 'ADMIN')
  create(
    @Body() dto: CreateReclamationDto,
    @Req() req: any,
  ) {
    return this.reclamationsService.create(
      dto,
      req.user.userId,
    )
  }

  // =========================================
  // MODIFICATION ADMIN
  // =========================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier une réclamation',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReclamationDto,
  ) {
    return this.reclamationsService.update(
      Number(id),
      dto,
    )
  }

  // =========================================
  // CHANGEMENT DE STATUT
  // =========================================

  @Patch(':id/statut')
  @ApiOperation({
    summary: 'Changer le statut',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'AGENT')
  updateStatut(
    @Param('id') id: string,
    @Body()
    body: { statut: string },
    @Req() req: any,
  ) {
    return this.reclamationsService.updateStatut(
      Number(id),
      body.statut,
      req.user.userId,
    )
  }

  // =========================================
  // SUPPRESSION ADMIN
  // =========================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Supprimer une réclamation',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  delete(
    @Param('id') id: string,
  ) {
    return this.reclamationsService.delete(
      Number(id),
    )
  }
}