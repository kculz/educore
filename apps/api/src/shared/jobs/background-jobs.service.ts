import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export interface BackgroundJobInput {
  queue: string;
  name: string;
  tenantId?: string | null;
  payload: Record<string, unknown>;
  status?: 'queued' | 'processed' | 'failed';
}

export interface BackgroundJobDescriptor {
  id: string;
  queue: string;
  name: string;
  tenantId: string | null;
  payload: Record<string, unknown>;
  status: 'queued' | 'processed' | 'failed';
  createdAt: string;
}

@Injectable()
export class BackgroundJobsService {
  createJobDescriptor(input: BackgroundJobInput): BackgroundJobDescriptor {
    return {
      id: randomUUID(),
      queue: input.queue,
      name: input.name,
      tenantId: input.tenantId ?? null,
      payload: input.payload,
      status: input.status ?? 'queued',
      createdAt: new Date().toISOString(),
    };
  }

  isTerminalStatus(status: BackgroundJobDescriptor['status']) {
    return status === 'processed' || status === 'failed';
  }
}

