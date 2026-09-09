import {
  IsNotEmpty,
  IsString,
} from 'class-validator'

export class EnvoyerReponseDto {
  @IsString()
  @IsNotEmpty()
  reponse!: string
}