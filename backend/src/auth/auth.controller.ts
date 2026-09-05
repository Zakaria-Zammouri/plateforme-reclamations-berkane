import {
  Body,
  Controller,
  Post,
  Get,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {


  constructor(
    private readonly authService: AuthService,
  ){}



  @Get()
  @ApiOperation({
    summary:'Test API Auth'
  })
  test(){

    return {
      message:'Auth API OK'
    };

  }



  @Post('register')
  @ApiOperation({
    summary:'Créer un compte'
  })
  register(
    @Body() dto:RegisterDto,
  ){

    return this.authService.register(
      dto.nom,
      dto.email,
      dto.password,
      dto.role,
    );

  }



  @Post('login')
  @ApiOperation({
    summary:'Connexion utilisateur'
  })
  login(
    @Body() dto:LoginDto,
  ){

    return this.authService.login(
      dto.email,
      dto.password,
    );

  }

}