export interface ProcessPaymentResult {
  success: boolean;
  transactionReference: string;
  error?: string;
}

export interface PaymentProvider {
  readonly name: string;
  processPayment(
    tenantId: string,
    invoiceId: string,
    amount: number,
    metadata?: Record<string, unknown>,
  ): Promise<ProcessPaymentResult>;
}
