import { ApiProperty } from '@nestjs/swagger';

export class DeleteBoardDTO {
  @ApiProperty()
  id: number;
}
