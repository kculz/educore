import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CreateQueueJobDto } from './dto/create-queue-job.dto';
import { QueuesService } from './queues.service';

type RequestWithContext = Request & {
  platformContext?: {
    tenantId: string;
  };
};

@ApiTags('Queues')
@ApiBearerAuth()
@Controller({ path: 'queues', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'queues.read' })
export class QueuesController {
  constructor(private readonly queuesService: QueuesService) {}

  @Get()
  list() {
    return this.queuesService.listQueues();
  }

  @Get('jobs')
  @AccessScope({ productCode: 'platform', permission: 'queues.read' })
  listJobs() {
    return this.queuesService.listJobs();
  }

  @Post(':queue/jobs')
  @AccessScope({ productCode: 'platform', permission: 'queues.write' })
  enqueue(
    @Req() request: RequestWithContext,
    @Param('queue') queue: string,
    @Body() dto: CreateQueueJobDto,
  ) {
    return this.queuesService.add(queue, dto.name, dto.payload, request.platformContext?.tenantId ?? null);
  }
}
