import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { InvoiceModel } from '../../../models/invoice';
import { invoicesKey } from '../queries/useAllInvoices';
import { createInvoice } from './createInvoice';
import { updateInvoice } from './updateInvoice';

export function useSaveInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: InvoiceModel }) =>
      id ? updateInvoice(id, input) : createInvoice(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [invoicesKey] }),
  });
}
