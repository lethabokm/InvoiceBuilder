import { useAllCustomers } from '../../customer/queries/useAllCustomers';
import { useAllSenders } from '../../sender/queries/useAllSenders';
import { calculateTotals } from '../../../features/invoices/calculations';
import type { InvoiceSummary, InvoiceStatus } from '../../../features/invoices/types';
import { useAllInvoices } from './useAllInvoices';
import { useAllStatuses } from './useAllStatuses';
import type { PageRequest } from '../../types';

function toStatusName(statusId: number, statusMap: Map<number, string>): InvoiceStatus {
  const name = statusMap.get(statusId)?.toLowerCase();
  if (name === 'draft' || name === 'sent' || name === 'paid') {
    return (name.charAt(0).toUpperCase() + name.slice(1)) as InvoiceStatus;
  }

  return 'Draft';
}

export function useInvoiceSummaries(request: PageRequest) {
  const invoicesQuery = useAllInvoices(request);
  const statusesQuery = useAllStatuses();
  const customersQuery = useAllCustomers();
  const sendersQuery = useAllSenders();
  const error =
    invoicesQuery.error ??
    statusesQuery.error ??
    customersQuery.error ??
    sendersQuery.error;

  const statuses = statusesQuery.data ?? [];
  const customers = customersQuery.data?.items ?? [];
  const senders = sendersQuery.data?.items ?? [];
  const statusMap = new Map(statuses.map((status) => [status.id, status.name]));

  const items: InvoiceSummary[] = (invoicesQuery.data?.items ?? []).map((invoice) => {
    const customer = customers.find((item) => item.email === invoice.customerEmail);
    const sender = senders.find((item) => item.email === invoice.senderEmail);
    const taxRate = invoice.taxRate;
    const lineItems = invoice.invoiceLineItems.map((lineItem) => ({
      id: lineItem.id.toString(),
      description: lineItem.description,
      quantity: lineItem.quantity,
      unitPrice: lineItem.unitPrice,
    }));
    const { total } = calculateTotals(lineItems, taxRate);

    return {
      id: invoice.id.toString(),
      invoiceNumber: invoice.invoiceNumber,
      customerName: customer?.companyName ?? invoice.customerEmail,
      senderName: sender?.companyName ?? invoice.senderEmail,
      issueDate: invoice.invoiceDate.slice(0, 10),
      dueDate: invoice.dueDate.slice(0, 10),
      status: toStatusName(invoice.statusId, statusMap),
      total,
    };
  });

  return {
    items,
    total: invoicesQuery.data?.total ?? 0,
    isLoading:
      invoicesQuery.isLoading ||
      statusesQuery.isLoading ||
      customersQuery.isLoading ||
      sendersQuery.isLoading,
    isError:
      invoicesQuery.isError ||
      statusesQuery.isError ||
      customersQuery.isError ||
      sendersQuery.isError,
    error,
  };
}
