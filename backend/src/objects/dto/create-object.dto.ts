import { IsString, IsOptional } from 'class-validator';

export class CreateObjectDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  descripton?: string;
}
