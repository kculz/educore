import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PaymentProvider, ProcessPaymentResult } from '../../domain/payment-provider.interface';

@Injectable()
export class InternalGatewayProvider implements PaymentProvider {
  readonly name = 'internal';

  async processPayment(
    tenantId: string,
    invoiceId: string,
    amount: number,
    metadata?: Record<string, unknown>,
  ): Promise<ProcessPaymentResult> {
    // Simulates payment process. Negative amounts will fail for simulation.
    if (amount <= 0) {
      return {
        success: false,
        transactionReference: '',
        error: 'Invalid payment amount',
      };
    }

    return {
      success: true,
      transactionReference: `TXN-${randomUUID().slice(0, 8).toUpperCase()}`,
    };
  }
}
