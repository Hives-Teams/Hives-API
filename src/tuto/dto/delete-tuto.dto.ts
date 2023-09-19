import { ApiProperty } from '@nestjs/swagger';

export class DeleteTutoDTO {
  @ApiProperty()
  id: number;
}
