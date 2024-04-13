import { ApiProperty } from '@nestjs/swagger';

class BoardImage {
  @ApiProperty()
  name: string;
}

class TutoCount {
  @ApiProperty()
  Tuto: number;
}

export class BoardDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty({ type: BoardImage })
  boardImage: BoardImage;
  @ApiProperty({ type: TutoCount })
  _count: TutoCount;
}
