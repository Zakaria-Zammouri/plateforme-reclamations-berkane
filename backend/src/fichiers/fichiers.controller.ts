import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  diskStorage,
} from 'multer';

import {
  extname,
} from 'path';


import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiTags,
} from '@nestjs/swagger';


import { FichiersService } from './fichiers.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { Roles } from '../roles/roles.decorator';



@ApiTags('Fichiers')
@ApiBearerAuth('access-token')
@Controller('reclamations/:reclamationId/fichiers')
export class FichiersController {


  constructor(
    private readonly fichiersService: FichiersService,
  ) {}



  // ============================
  // Liste fichiers
  // ============================


  @Get()

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
    reclamationId:string,

  ){

    return this.fichiersService.getByReclamation(
      Number(reclamationId),
    );

  }




  // ============================
  // Upload fichier
  // ============================


  @Post()

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

    schema:{

      type:'object',

      properties:{

        file:{

          type:'string',

          format:'binary',

        },

      },

    },

  })



  @UseInterceptors(

    FileInterceptor(

      'file',

      {

        storage: diskStorage({

          destination:'./uploads',


          filename(
            req,
            file,
            callback,
          ){


            const filename =
              Date.now()
              +
              '-'
              +
              Math.round(
                Math.random()*1000000000,
              );


            callback(

              null,

              filename + extname(
                file.originalname,
              ),

            );


          },


        }),



        limits:{

          fileSize:
          5 * 1024 * 1024,

        },



        fileFilter(

          req,

          file,

          callback,

        ){


          const allowed = [

            'application/pdf',

            'image/jpeg',

            'image/png',

          ];



          if(
            allowed.includes(
              file.mimetype,
            )
          ){

            callback(
              null,
              true,
            );

          }

          else{


            callback(

              new BadRequestException(
                'Type fichier non autorisé',
              ),

              false,

            );


          }


        },


      },

    ),

  )



  async create(


    @Param('reclamationId')
    reclamationId:string,


    @UploadedFile()
    file:Express.Multer.File,


  ){


    if(!file){

      throw new BadRequestException(
        'Aucun fichier envoyé',
      );

    }



    return this.fichiersService.create(

      Number(reclamationId),


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


    );


  }







  // ============================
  // Supprimer fichier
  // ============================


  @Delete(':id')


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
    reclamationId:string,


    @Param('id')
    id:string,


  ){


    return this.fichiersService.delete(

      Number(id),

      Number(reclamationId),

    );


  }



}