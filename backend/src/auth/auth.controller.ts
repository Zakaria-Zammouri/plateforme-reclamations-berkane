import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common'

import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Test API Auth',
  })
  test() {
    return {
      message: 'Auth API OK',
    }
  }

  @Post('register')
  @ApiOperation({
    summary: 'Créer un compte citoyen',
  })
  register(
    @Body() dto: RegisterDto,
  ) {
    return this.authService.register(
      dto.nom,
      dto.email,
      dto.password,
    )
  }

  @Post('login')
  @ApiOperation({
    summary: 'Connexion utilisateur',
  })
  login(
    @Body() dto: LoginDto,
  ) {
    return this.authService.login(
      dto.email,
      dto.password,
    )
  }
}