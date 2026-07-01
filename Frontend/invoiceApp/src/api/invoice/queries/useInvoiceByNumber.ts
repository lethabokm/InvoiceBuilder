import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { InvoiceModel } from '../../../models/invoice';
import { invoicesKey } from './useAllInvoices';

async function fetchInvoiceByNumber(invoiceNumber: string): Promise<InvoiceModel> {
  const { data } = await apiClient.get<InvoiceModel>(
    `/api/invoices/${encodeURIComponent(invoiceNumber)}`,
  );
  return data;
}

export function useInvoiceByNumber(invoiceNumber: string | undefined) {
  return useQuery({
    queryKey: [invoicesKey, 'by-number', invoiceNumber],
    queryFn: () => fetchInvoiceByNumber(invoiceNumber as string),
    enabled: Boolean(invoiceNumber),
  });
}
