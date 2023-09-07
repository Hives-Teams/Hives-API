import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class IdUserDTO {
  @ApiProperty()
  @IsNotEmpty()
  id: number;
}
