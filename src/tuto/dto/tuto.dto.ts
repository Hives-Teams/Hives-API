import { ApiProperty } from '@nestjs/swagger';
export class TutoDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  idSocial: number;
  @ApiProperty()
  URL: string;
  @ApiProperty()
  idBoard: number;
}
