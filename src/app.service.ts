/* istanbul ignore file */

import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return null;
  }

  async maintenance(): Promise<{ maintenance: boolean; message?: string }> {
    if (Boolean(Number(process.env.MAINTENANCE))) {
      return {
        maintenance: Boolean(Number(process.env.MAINTENANCE)),
        message: process.env.MAINTENANCE_MESSAGE,
      };
    }
    return { maintenance: false };
  }
}
