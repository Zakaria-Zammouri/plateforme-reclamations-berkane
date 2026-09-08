import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'

import {
  FileInterceptor,
} from '@nestjs/platform-express'

import {
  diskStorage,
} from 'multer'

import {
  extname,
} from 'path'

import {
  Response,
} from 'express'

import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { FichiersService } from './fichiers.service'

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../guards/roles/roles.guard'
import { Roles } from '../roles/roles.decorator'

@ApiTags('Fichiers')
@ApiBearerAuth('access-token')
@Controller('reclamations/:reclamationId/fichiers')
export class FichiersController {
  constructor(
    private readonly fichiersService: FichiersService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Liste les fichiers d’une réclamation',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'AGENT',
    'CITOYEN',
  )
  getByReclamation(
    @Param('reclamationId')
    reclamationId: string,

    @Req() req: any,
  ) {
    return this.fichiersService.getByReclamation(
      Number(reclamationId),
      req.user.userId,
      req.user.role,
    )
  }

  @Get(':id/telecharger')
  @ApiOperation({
    summary:
      'Télécharger un fichier protégé',
  })
  @UseGuards(
    JwtAuthGuard,
  )
  async download(
    @Param('reclamationId')
    reclamationId: string,

    @Param('id')
    id: string,

    @Req() req: any,

    @Res() res: Response,
  ) {
    const fichier =
      await this.fichiersService.download(
        Number(id),
        Number(reclamationId),
        req.user.userId,
        req.user.role,
      )

    res.setHeader(
      'Content-Type',
      fichier.typeMime,
    )

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(
        fichier.nomFichier,
      )}"`,
    )

    res.send(fichier.contenu)
  }

  @Post()
  @ApiOperation({
    summary:
      'Ajouter un fichier à une réclamation',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'AGENT',
    'CITOYEN',
  )
  @ApiConsumes(
    'multipart/form-data',
  )
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor(
      'file',
      {
        storage: diskStorage({
          destination: './uploads',

          filename(
            req,
            file,
            callback,
          ) {
            const filename =
              Date.now() +
              '-' +
              Math.round(
                Math.random() *
                  1000000000,
              )

            callback(
              null,
              filename +
                extname(
                  file.originalname,
                ),
            )
          },
        }),

        limits: {
          fileSize:
            5 * 1024 * 1024,
        },

        fileFilter(
          req,
          file,
          callback,
        ) {
          const allowed = [
            'application/pdf',
            'image/jpeg',
            'image/png',
          ]

          if (
            allowed.includes(
              file.mimetype,
            )
          ) {
            callback(
              null,
              true,
            )
          } else {
            callback(
              new BadRequestException(
                'Type fichier non autorisé',
              ),
              false,
            )
          }
        },
      },
    ),
  )
  async create(
    @Param('reclamationId')
    reclamationId: string,

    @UploadedFile()
    file: Express.Multer.File,

    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Aucun fichier envoyé',
      )
    }

    return this.fichiersService.create(
      Number(reclamationId),
      req.user.userId,
      req.user.role,
      {
        nomFichier:
          file.originalname,

        chemin:
          file.path,

        typeMime:
          file.mimetype,

        taille:
          file.size,
      },
    )
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Supprimer un fichier',
  })
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles(
    'ADMIN',
    'CITOYEN',
  )
  delete(
    @Param('reclamationId')
    reclamationId: string,

    @Param('id')
    id: string,

    @Req() req: any,
  ) {
    return this.fichiersService.delete(
      Number(id),
      Number(reclamationId),
      req.user.userId,
      req.user.role,
    )
  }
}