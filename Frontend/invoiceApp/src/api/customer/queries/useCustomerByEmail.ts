import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { CustomerModel } from '../../../models/customer';
import { customersKey } from './useAllCustomers';

async function fetchCustomerByEmail(email: string): Promise<CustomerModel> {
  const { data } = await apiClient.get<CustomerModel>(`/api/customers/${encodeURIComponent(email)}`);
  return data;
}

export function useCustomerByEmail(email: string | undefined) {
  return useQuery({
    queryKey: [customersKey, 'by-email', email],
    queryFn: () => fetchCustomerByEmail(email as string),
    enabled: Boolean(email),
  });
}
