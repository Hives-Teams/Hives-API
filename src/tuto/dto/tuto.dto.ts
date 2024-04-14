import { ApiProperty } from '@nestjs/swagger';

class SocialNetworks {
  @ApiProperty()
  name: string;
}

export class TutoDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  image: string;
  @ApiProperty({ type: SocialNetworks })
  SocialNetworks: SocialNetworks;
  @ApiProperty()
  URL: string;
  @ApiProperty()
  idBoard: number;
  @ApiProperty()
  createdAt: Date;
}
