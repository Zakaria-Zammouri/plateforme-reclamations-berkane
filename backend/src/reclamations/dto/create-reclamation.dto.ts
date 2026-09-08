import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateReclamationDto {
  @IsString()
  titre!: string

  @IsString()
  description!: string

  @IsOptional()
  @IsString()
  numeroBureauOrdre?: string

  @IsOptional()
  @IsDateString()
  dateBureauOrdre?: string

  @IsOptional()
  @IsDateString()
  dateReception?: string

  @IsOptional()
  @IsString()
  departement?: string

  @IsOptional()
  @IsString()
  service?: string

  @IsOptional()
  @IsString()
  misEnCause?: string

  @IsOptional()
  @IsString()
  @IsIn([
    'BASSE',
    'NORMALE',
    'HAUTE',
    'URGENTE',
  ])
  priorite?: string
}