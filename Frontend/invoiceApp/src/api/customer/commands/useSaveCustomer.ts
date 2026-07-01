import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CustomerInputModel } from '../../../models/customer';
import { customersKey } from '../queries/useAllCustomers';
import { createCustomer } from './createCustomer';
import { updateCustomer } from './updateCustomer';

export function useSaveCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CustomerInputModel }) =>
      id ? updateCustomer(id, input) : createCustomer(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [customersKey] }),
  });
}
