import { apiClient } from '../../client';
import type { InvoiceModel } from '../../../models/invoice';

export async function createInvoice(input: InvoiceModel): Promise<InvoiceModel> {
  const payload: InvoiceModel = {
    ...input,
    id: 0,
    invoiceNumber: '',
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    invoiceLineItems: input.invoiceLineItems.map((item) => ({
      ...item,
      id: 0,
      invoiceNumber: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    })),
  };

  const { data } = await apiClient.post<InvoiceModel>('/api/invoices', payload);
  return data;
}
