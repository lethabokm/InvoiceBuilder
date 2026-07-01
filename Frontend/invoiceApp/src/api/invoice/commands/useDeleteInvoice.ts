import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../client';
import { invoicesKey } from '../queries/useAllInvoices';

async function deleteInvoice(invoiceNumber: string): Promise<void> {
  await apiClient.delete(`/api/invoices/${encodeURIComponent(invoiceNumber)}`);
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invoiceNumber: string) => deleteInvoice(invoiceNumber),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [invoicesKey] }),
  });
}
