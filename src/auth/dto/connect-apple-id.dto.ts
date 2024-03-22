import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ConnectAppleIdDTO {
  @ApiProperty()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nonce: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  idDevice: string;
}
