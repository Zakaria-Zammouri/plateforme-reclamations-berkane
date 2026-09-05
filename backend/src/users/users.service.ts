import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class UsersService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}


  // Tous les utilisateurs
  async getAll() {

    return this.prisma.user.findMany({

      select: {
        id: true,
        nom: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },

      orderBy: {
        createdAt: 'desc',
      },

    });

  }



  // Un utilisateur
  async getOne(id:number) {

    const user = await this.prisma.user.findUnique({

      where:{
        id,
      },

      select:{
        id:true,
        nom:true,
        email:true,
        role:true,
        createdAt:true,
        updatedAt:true,
      },

    });


    if(!user){

      throw new NotFoundException(
        'Utilisateur introuvable'
      );

    }


    return user;

  }




  // Modifier utilisateur
  async update(
    id:number,
    data:any,
  ){

    const user = await this.prisma.user.findUnique({

      where:{
        id,
      }

    });


    if(!user){

      throw new NotFoundException(
        'Utilisateur introuvable'
      );

    }


    return this.prisma.user.update({

      where:{
        id,
      },

      data:{
        nom:data.nom,
        role:data.role,
      },

      select:{
        id:true,
        nom:true,
        email:true,
        role:true,
      },

    });

  }




  // Supprimer utilisateur
  async delete(id:number){

    const user = await this.prisma.user.findUnique({

      where:{
        id,
      }

    });


    if(!user){

      throw new NotFoundException(
        'Utilisateur introuvable'
      );

    }


    return this.prisma.user.delete({

      where:{
        id,
      },

    });

  }


}