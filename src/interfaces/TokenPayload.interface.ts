export interface TokenPayloadInterface {
  sub: number;
  email: string;
  refreshToken?: string;
}
