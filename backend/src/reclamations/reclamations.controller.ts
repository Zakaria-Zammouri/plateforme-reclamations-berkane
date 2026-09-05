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
} from '@nestjs/common';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
} from '@nestjs/swagger';

import { ReclamationsService } from './reclamations.service';

import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';

import { RolesGuard } from '../guards/roles/roles.guard';

import { Roles } from '../roles/roles.decorator';



@ApiTags('Reclamations')
@ApiBearerAuth('access-token') // <-- doit matcher le nom donné dans addBearerAuth() de main.ts
@Controller('reclamations')
export class ReclamationsController {


  constructor(
    private readonly reclamationsService: ReclamationsService,
  ) {}



  // ==============================
  // ADMIN / AGENT
  // Toutes les réclamations
  // ==============================

  @Get()

  @ApiOperation({
    summary: 'Liste toutes les réclamations',
  })

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )

  @Roles(
    'ADMIN',
    'AGENT',
  )

  getAll(){

    return this.reclamationsService.getAll();

  }




  // ==============================
  // CITOYEN
  // Mes réclamations
  // ==============================

  @Get('mes')

  @ApiOperation({
    summary:'Voir mes réclamations',
  })

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )

  @Roles(
    'CITOYEN',
  )

  getMyReclamations(
    @Req() req:any,
  ){

    return this.reclamationsService.getMyReclamations(
      req.user.userId
    );

  }





  // ==============================
  // DETAIL
  // ==============================

  @Get(':id')

  @ApiOperation({
    summary:'Afficher une réclamation',
  })

  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )

  @Roles(
    'ADMIN',
    'AGENT',
  )

  getOne(
    @Param('id') id:string,
  ){

    return this.reclamationsService.getOne(
      Number(id),
    );

  }





  // ==============================
  // CREATION RECLAMATION
  // CITOYEN
  // ==============================


  @Post()

  @ApiOperation({
    summary:'Créer une réclamation',
  })


  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )


  // ADMIN ajouté seulement pour test
  // En production garder seulement CITOYEN
  @Roles(
    'CITOYEN',
    'ADMIN',
  )


  create(

    @Body()
    dto:CreateReclamationDto,


    @Req()
    req:any,

  ){

    return this.reclamationsService.create(

      dto,

      req.user.userId

    );

  }







  // ==============================
  // MODIFICATION ADMIN
  // ==============================


  @Patch(':id')


  @ApiOperation({
    summary:'Modifier une réclamation',
  })


  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )


  @Roles(
    'ADMIN',
  )


  update(

    @Param('id')
    id:string,


    @Body()
    dto:UpdateReclamationDto,

  ){

    return this.reclamationsService.update(

      Number(id),

      dto,

    );

  }







  // ==============================
  // CHANGER STATUT
  // ==============================


  @Patch(':id/statut')


  @ApiOperation({
    summary:'Changer le statut',
  })


  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )


  @Roles(
    'ADMIN',
    'AGENT',
  )


  updateStatut(

    @Param('id')
    id:string,


    @Body()
    body:{
      statut:string;
    },

  ){


    return this.reclamationsService.updateStatut(

      Number(id),

      body.statut,

    );


  }







  // ==============================
  // SUPPRESSION ADMIN
  // ==============================


  @Delete(':id')


  @ApiOperation({
    summary:'Supprimer une réclamation',
  })


  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )


  @Roles(
    'ADMIN',
  )


  delete(

    @Param('id')
    id:string,

  ){

    return this.reclamationsService.delete(

      Number(id),

    );

  }


}