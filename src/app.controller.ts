/* istanbul ignore file */

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('maintenance')
  async maintenance(): Promise<{ maintenance: boolean; message?: string }> {
    return this.appService.maintenance();
  }
}
