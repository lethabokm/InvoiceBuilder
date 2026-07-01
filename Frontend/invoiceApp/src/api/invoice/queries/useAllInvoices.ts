import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { PagedResult, PageRequest } from '../../types';
import type { InvoiceModel } from '../../../models/invoice';

export const invoicesKey = 'invoices';

async function fetchAllInvoices(request: PageRequest): Promise<PagedResult<InvoiceModel>> {
  const { data } = await apiClient.get<PagedResult<InvoiceModel>>('/api/invoices', {
    params: request,
  });

  return data;
}

export function useAllInvoices(request: PageRequest = { page: 1, pageSize: 100 }) {
  return useQuery({
    queryKey: [invoicesKey, 'all', request.page, request.pageSize],
    queryFn: () => fetchAllInvoices(request),
  });
}
