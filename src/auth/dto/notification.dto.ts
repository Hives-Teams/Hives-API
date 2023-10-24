import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class NotificationDTO {
  @ApiProperty()
  token: string;
  @ApiProperty()
  @IsUUID()
  idDevice: string;
}
