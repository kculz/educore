import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

import { PlatformConfigService } from '../../config/platform-config.service';
import { PlatformStateService } from '../platform-state/platform-state.service';

@Injectable()
export class QueuesService {
  private readonly queues = new Map<string, Queue>();
  private readonly defaultQueues = [
    'emails',
    'notifications',
    'reports',
    'imports',
    'exports',
    'backups',
    'pdf-generation',
  ];

  constructor(
    private readonly config: PlatformConfigService,
    private readonly platformState: PlatformStateService,
  ) {}

  listQueues() {
    return Array.from(new Set([...this.defaultQueues, ...this.queues.keys()])).map((name) => ({
      name,
      connection: this.config.redisUrl,
    }));
  }

  listJobs(queue?: string) {
    return this.platformState.listQueueJobs(queue);
  }

  async add(queueName: string, name: string, payload: Record<string, unknown>, tenantId: string | null = null) {
    const queue = this.getQueue(queueName);
    const job = await queue.add(name, payload, {
      removeOnComplete: true,
      removeOnFail: false,
    });
    this.platformState.recordQueueJob({
      queue: queueName,
      name,
      tenantId,
      payload,
      status: 'queued',
    });
    return {
      id: job.id,
      queue: queueName,
      name,
    };
  }

  private getQueue(name: string) {
    const existing = this.queues.get(name);
    if (existing) {
      return existing;
    }

    const queue = new Queue(name, {
      connection: { url: this.config.redisUrl },
    });
    this.queues.set(name, queue);
    return queue;
  }
}
