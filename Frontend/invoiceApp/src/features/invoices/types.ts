export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

export const invoiceStatuses: InvoiceStatus[] = ['Draft', 'Sent', 'Paid'];

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  senderId: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  taxRate: number;
  notes: string;
  lineItems: InvoiceLineItem[];
}

export type InvoiceInput = Omit<Invoice, 'id'>;

export interface InvoiceSummary {
  id: string;
  invoiceNumber: string;
  customerName: string;
  senderName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  total: number;
}

export const emptyLineItem = (): InvoiceLineItem => ({
  id: crypto.randomUUID(),
  description: '',
  quantity: 1,
  unitPrice: 0,
});

export const buildEmptyInvoice = (): InvoiceInput => {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 30);
  return {
    invoiceNumber: '',
    customerId: '',
    senderId: '',
    issueDate: today.toISOString().slice(0, 10),
    dueDate: due.toISOString().slice(0, 10),
    status: 'Draft',
    taxRate: 15,
    notes: '',
    lineItems: [emptyLineItem()],
  };
};

export const toInvoiceInput = (invoice: Invoice): InvoiceInput => ({
  invoiceNumber: invoice.invoiceNumber,
  customerId: invoice.customerId,
  senderId: invoice.senderId,
  issueDate: invoice.issueDate,
  dueDate: invoice.dueDate,
  status: invoice.status,
  taxRate: invoice.taxRate,
  notes: invoice.notes,
  lineItems: invoice.lineItems,
});
