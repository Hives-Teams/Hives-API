import { ApiProperty } from '@nestjs/swagger';
export class AccessTokenDTO {
  @ApiProperty()
  access_token: string;
}
