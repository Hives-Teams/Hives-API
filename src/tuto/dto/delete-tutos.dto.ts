import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class DeleteTutosDTO {
  @ApiProperty()
  @IsArray()
  id: number[];
}
