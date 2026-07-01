import type { InvoiceLineItemModel } from './invoiceLineItem';

export interface InvoiceModel {
  id: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  notes: string;
  statusId: number;
  senderEmail: string;
  customerEmail: string;
  createdAt: string;
  modifiedAt: string;
  invoiceLineItems: InvoiceLineItemModel[];
}
