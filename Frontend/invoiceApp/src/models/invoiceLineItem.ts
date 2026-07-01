export interface InvoiceLineItemModel {
  id: number;
  invoiceNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  modifiedAt: string;
}
