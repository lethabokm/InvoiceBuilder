import { useAllStatuses } from './useAllStatuses';
import { useInvoiceByNumber } from './useInvoiceByNumber';
import type { Invoice as FeatureInvoice, InvoiceStatus } from '../../../features/invoices/types';

function toStatusName(statusId: number, statusMap: Map<number, string>): InvoiceStatus {
  const name = statusMap.get(statusId)?.toLowerCase();
  if (name === 'draft' || name === 'sent' || name === 'paid') {
    return (name.charAt(0).toUpperCase() + name.slice(1)) as InvoiceStatus;
  }

  return 'Draft';
}

function toFeatureInvoice(model: import('../../../models/invoice').InvoiceModel, statusMap: Map<number, string>): FeatureInvoice {
  return {
    id: model.id.toString(),
    invoiceNumber: model.invoiceNumber,
    customerId: model.customerEmail,
    senderId: model.senderEmail,
    issueDate: model.invoiceDate.slice(0, 10),
    dueDate: model.dueDate.slice(0, 10),
    status: toStatusName(model.statusId, statusMap),
    taxRate: model.taxRate,
    notes: model.notes,
    lineItems: model.invoiceLineItems.map((lineItem) => ({
      id: lineItem.id.toString(),
      description: lineItem.description,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
    })),
  };
}

export function useInvoice(invoiceNumber: string | undefined) {
  const invoiceQuery = useInvoiceByNumber(invoiceNumber);
  const statusesQuery = useAllStatuses();
  const statusMap = new Map((statusesQuery.data ?? []).map((status) => [status.id, status.name]));
  const error = invoiceQuery.error ?? statusesQuery.error;

  return {
    data: invoiceQuery.data ? toFeatureInvoice(invoiceQuery.data, statusMap) : undefined,
    isLoading: invoiceQuery.isLoading || statusesQuery.isLoading,
    isError: invoiceQuery.isError || statusesQuery.isError,
    error,
  };
}
