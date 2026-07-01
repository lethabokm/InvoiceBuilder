import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../../client';
import { useAllStatuses } from '../queries/useAllStatuses';
import { useSaveInvoice } from './useSaveInvoice';
import type { InvoiceInput, InvoiceStatus } from '../../../features/invoices/types';
import type { InvoiceModel } from '../../../models/invoice';

function statusToId(status: InvoiceStatus, statusMap: Map<string, number>): number {
  return statusMap.get(status.toLowerCase()) ?? 1;
}

function toModelInvoice(input: InvoiceInput, existing?: InvoiceModel, statusId = 1): InvoiceModel {
  return {
    id: existing?.id ?? 0,
    invoiceNumber: existing?.invoiceNumber ?? input.invoiceNumber,
    invoiceDate: input.issueDate,
    dueDate: input.dueDate,
    currency: 'ZAR',
    taxRate: input.taxRate,
    notes: input.notes,
    statusId,
    senderEmail: input.senderId,
    customerEmail: input.customerId,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    invoiceLineItems: input.lineItems.map((lineItem) => ({
      id: Number.isNaN(Number(lineItem.id)) ? 0 : Number(lineItem.id),
      invoiceNumber: existing?.invoiceNumber ?? input.invoiceNumber,
      description: lineItem.description,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
      total: lineItem.quantity * lineItem.unitPrice,
      createdAt:
        existing?.invoiceLineItems.find((existingItem) => existingItem.id === Number(lineItem.id))
          ?.createdAt ?? new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    })),
  };
}

export function useSaveInvoiceInput() {
  const saveInvoice = useSaveInvoice();
  const statusesQuery = useAllStatuses();
  const statusByName = new Map(
    (statusesQuery.data ?? []).map((status) => [status.name.toLowerCase(), status.id]),
  );

  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: InvoiceInput }) => {
      const existing = id
        ? await apiClient
            .get<InvoiceModel>(`/api/invoices/${encodeURIComponent(id)}`)
            .then((result) => result.data)
        : undefined;
      const model = toModelInvoice(input, existing, statusToId(input.status, statusByName));
      return saveInvoice.mutateAsync({ id, input: model });
    },
  });
}
