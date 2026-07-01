import type { InvoiceLineItem } from './types';

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export function calculateLineTotal(item: Pick<InvoiceLineItem, 'quantity' | 'unitPrice'>): number {
  return item.quantity * item.unitPrice;
}

export function calculateTotals(lineItems: InvoiceLineItem[], taxRate: number): InvoiceTotals {
  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
}
