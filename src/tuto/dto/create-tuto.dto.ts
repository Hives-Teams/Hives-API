import { ApiProperty } from '@nestjs/swagger';

export class CreateTutoDTO {
  @ApiProperty()
  title: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  board: string;
}
