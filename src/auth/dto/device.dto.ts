import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeviceDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  idDevice: string;
}
