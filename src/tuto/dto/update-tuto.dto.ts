import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateTutoDTO {
  @ApiProperty()
  @IsNotEmpty()
  idTuto: number;

  @ApiProperty()
  @IsNotEmpty()
  title: string;
}
