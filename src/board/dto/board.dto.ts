import { ApiProperty } from '@nestjs/swagger';

export class BoardDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}
