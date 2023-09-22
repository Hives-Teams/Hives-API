import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class EmailDTO {
  @ApiProperty()
  @IsNotEmpty()
  email: string;
}
