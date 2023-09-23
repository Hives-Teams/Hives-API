import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class ChangeForgotPasswordDTO {
  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  code: number;

  @ApiProperty()
  @IsNotEmpty()
  @Matches(/^(?=.*[A-Z])(?=.*[\W_]).{8,}$/, {
    message: '8 caractères min, 1 majuscule et 1 caractère spécial',
  })
  newPassword: string;
}
