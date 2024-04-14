import { ApiProperty } from '@nestjs/swagger';

export class MetadataDTO {
  @ApiProperty()
  title: string;
  @ApiProperty()
  image: string;
}
