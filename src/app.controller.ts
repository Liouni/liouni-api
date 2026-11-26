import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService, HealthResult } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  async getHealth(): Promise<HealthResult> {
    const result = await this.appService.getHealth();
    if (!result.ok) {
      throw new ServiceUnavailableException(result);
    }
    return result;
  }
}
