import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;
}
