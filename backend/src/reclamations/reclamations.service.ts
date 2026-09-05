import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { CreateReclamationDto } from './dto/create-reclamation.dto';
import { UpdateReclamationDto } from './dto/update-reclamation.dto';


@Injectable()
export class ReclamationsService {


  constructor(
    private readonly prisma: PrismaService,
  ){}



  // ADMIN / AGENT
  // Toutes les réclamations

  async getAll(){

    return this.prisma.reclamation.findMany({

      include:{

        user:{
          select:{
            id:true,
            nom:true,
            email:true,
            role:true,
          },
        },

        fichiers:true,

      },

      orderBy:{
        createdAt:'desc',
      },

    });

  }





  // détail

  async getOne(id:number){


    const reclamation =
      await this.prisma.reclamation.findUnique({

        where:{
          id,
        },

        include:{

          user:{
            select:{
              id:true,
              nom:true,
              email:true,
              role:true,
            },
          },

          fichiers:true,

        },

      });



    if(!reclamation){

      throw new NotFoundException(
        'Réclamation introuvable',
      );

    }


    return reclamation;

  }





  // citoyen connecté

  async getMyReclamations(
    userId:number,
  ){


    return this.prisma.reclamation.findMany({

      where:{
        userId,
      },

      include:{
        fichiers:true,
      },


      orderBy:{
        createdAt:'desc',
      },

    });


  }





  // création

  async create(
    dto:CreateReclamationDto,
    userId:number,
  ){


    const last =
      await this.prisma.reclamation.findFirst({

        orderBy:{
          numeroClassement:'desc',
        },

      });



    const numeroClassement =
      last
      ? last.numeroClassement + 1
      : 1;




    return this.prisma.reclamation.create({

      data:{


        numeroClassement,


        titre:
        dto.titre,


        description:
        dto.description,



        numeroBureauOrdre:
        dto.numeroBureauOrdre,



        dateBureauOrdre:
        dto.dateBureauOrdre
        ?
        new Date(dto.dateBureauOrdre)
        :
        null,



        dateReception:
        dto.dateReception
        ?
        new Date(dto.dateReception)
        :
        null,



        departement:
        dto.departement,



        service:
        dto.service,



        misEnCause:
        dto.misEnCause,



        userId,

      },

    });


  }





  // modification ADMIN

  async update(
    id:number,
    dto:UpdateReclamationDto,
  ){


    const reclamation =
      await this.prisma.reclamation.findUnique({

        where:{
          id,
        },

      });



    if(!reclamation){

      throw new NotFoundException(
        'Réclamation introuvable',
      );

    }



    return this.prisma.reclamation.update({

      where:{
        id,
      },


      data:{

        ...dto,


        dateBureauOrdre:
        dto.dateBureauOrdre
        ?
        new Date(dto.dateBureauOrdre)
        :
        undefined,


        dateReception:
        dto.dateReception
        ?
        new Date(dto.dateReception)
        :
        undefined,

      },


    });


  }





  // changer statut

  async updateStatut(
    id:number,
    statut:string,
  ){


    const reclamation =
      await this.prisma.reclamation.findUnique({

        where:{
          id,
        },

      });



    if(!reclamation){

      throw new NotFoundException(
        'Réclamation introuvable',
      );

    }



    return this.prisma.reclamation.update({

      where:{
        id,
      },


      data:{
        statut,
      },


    });


  }





  // suppression

  async delete(
    id:number,
  ){


    const reclamation =
      await this.prisma.reclamation.findUnique({

        where:{
          id,
        },

      });



    if(!reclamation){

      throw new NotFoundException(
        'Réclamation introuvable',
      );

    }



    return this.prisma.reclamation.delete({

      where:{
        id,
      },

    });


  }


}