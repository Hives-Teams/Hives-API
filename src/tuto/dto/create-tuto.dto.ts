import { ApiProperty } from '@nestjs/swagger';

export class CreateTutoDTO {
  @ApiProperty()
  url: string;
  @ApiProperty()
  board: number[];
}
