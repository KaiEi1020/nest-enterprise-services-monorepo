import { Controller, Get } from '@nestjs/common';

/**
 * Liveness/readiness probe backing the ACK startup, readiness and liveness
 * probes mandated by ADR-0005. This is a technical capability only; it must
 * not perform business work or touch domain data.
 */
@Controller('health')
export class HealthController {
  @Get('live')
  live() {
    return { status: 'ok' };
  }

  @Get('ready')
  ready() {
    return { status: 'ok' };
  }
}
