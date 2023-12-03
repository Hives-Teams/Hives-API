import { ApiProperty } from '@nestjs/swagger';

class BoardImage {
  @ApiProperty()
  name: string;
}

export class BoardDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: BoardImage })
  boardImage: BoardImage;
}
