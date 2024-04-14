import { ApiProperty } from '@nestjs/swagger';

export class SetMetadataDTO {
  @ApiProperty()
  idTuto: number;
}
