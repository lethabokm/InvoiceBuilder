import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../client';
import { customersKey } from '../queries/useAllCustomers';

async function deleteCustomer(email: string): Promise<void> {
  await apiClient.delete(`/api/customers/${encodeURIComponent(email)}`);
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email: string) => deleteCustomer(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [customersKey] }),
  });
}
