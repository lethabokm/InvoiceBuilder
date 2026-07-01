import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { PagedResult, PageRequest } from '../../types';
import type { CustomerModel } from '../../../models/customer';

export const customersKey = 'customers';

async function fetchAllCustomers(request: PageRequest): Promise<PagedResult<CustomerModel>> {
  const { data } = await apiClient.get<PagedResult<CustomerModel>>('/api/customers', {
    params: request,
  });
  return data;
}

export function useAllCustomers(request: PageRequest = { page: 1, pageSize: 100 }) {
  return useQuery({
    queryKey: [customersKey, 'all', request.page, request.pageSize],
    queryFn: () => fetchAllCustomers(request),
  });
}
