import { apiClient } from '../../client';
import type { InvoiceModel } from '../../../models/invoice';

export async function updateInvoice(
  invoiceNumber: string,
  input: InvoiceModel,
): Promise<InvoiceModel> {
  const payload: InvoiceModel = {
    ...input,
    modifiedAt: new Date().toISOString(),
    invoiceLineItems: input.invoiceLineItems.map((item) => ({
      ...item,
      modifiedAt: new Date().toISOString(),
    })),
  };

  const { data } = await apiClient.put<InvoiceModel>(
    `/api/invoices/${encodeURIComponent(invoiceNumber)}`,
    payload,
  );
  return data;
}
