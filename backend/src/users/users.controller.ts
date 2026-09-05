import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';

import { UsersService } from './users.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { Roles } from '../roles/roles.decorator';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {


  constructor(
    private readonly usersService: UsersService,
  ){}



  @Get()
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  getAll(){

    return this.usersService.getAll();

  }




  @Get(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  getOne(
    @Param('id') id:string,
  ){

    return this.usersService.getOne(
      Number(id)
    );

  }





  @Patch(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  update(

    @Param('id') id:string,

    @Body() body:any,

  ){

    return this.usersService.update(
      Number(id),
      body,
    );

  }





  @Delete(':id')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard,
  )
  @Roles('ADMIN')
  delete(

    @Param('id') id:string,

  ){

    return this.usersService.delete(
      Number(id)
    );

  }


}