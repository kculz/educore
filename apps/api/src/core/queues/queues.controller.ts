import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';

import { AccessScope } from '../platform-access/platform-access.decorator';
import { CurrentTenantId } from '../platform-access/platform-request.decorator';
import { CreateQueueJobDto } from './dto/create-queue-job.dto';
import { QueuesService } from './queues.service';

@ApiTags('Queues')
@ApiBearerAuth()
@Controller({ path: 'queues', version: '1' })
@AccessScope({ productCode: 'platform', permission: 'queues.read' })
export class QueuesController {
  constructor(@Inject(QueuesService) private readonly queuesService: QueuesService) {}

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
  @ApiBody({ type: CreateQueueJobDto })
  enqueue(
    @CurrentTenantId() tenantId: string | null,
    @Param('queue') queue: string,
    @Body() dto: CreateQueueJobDto,
  ) {
    return this.queuesService.add(queue, dto.name, dto.payload, tenantId ?? null);
  }
}
