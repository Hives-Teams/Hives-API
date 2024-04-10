export interface TokenPayloadInterface {
  sub: number;
  email: string;
  firstName: string;
  lastName: string;
  refreshToken?: string;
}
