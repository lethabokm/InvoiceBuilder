import type { PagedResult, PageRequest } from './types';
import type { CustomerModel as Customer } from '../models/customer';
import type { SenderModel as Sender } from '../models/sender';
import type { Invoice } from '../features/invoices/types';

const LATENCY_MS = 250;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function paginate<T>(items: T[], { page, pageSize }: PageRequest): PagedResult<T> {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  };
}

const customers: Customer[] = [
  {
    id: 1,
    companyName: 'Acme Corporation',
    contactPerson: 'Ava Reed',
    email: 'billing@acme.com',
    address: '120 Market Street',
    postalCode: '94105',
    taxId: 'US-ACME-001',
    active: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
  {
    id: 2,
    companyName: 'Globex Ltd',
    contactPerson: 'Noah Mills',
    email: 'accounts@globex.com',
    address: '8 Canada Square',
    postalCode: 'E14 5HQ',
    taxId: 'UK-GLOBEX-002',
    active: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

const senders: Sender[] = [
  {
    id: 1,
    companyName: 'Bright Studio LLC',
    contactPerson: 'Mia Carter',
    email: 'hello@brightstudio.com',
    phone: '+1 415 555 0199',
    address: '500 Howard Street',
    taxId: 'US-998877',
    bankDetails: 'US00BRIGHT00012345',
    active: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

const invoices: Invoice[] = [
  {
    id: crypto.randomUUID(),
    invoiceNumber: 'INV-1001',
    customerId: customers[0].email,
    senderId: senders[0].email,
    issueDate: '2026-06-01',
    dueDate: '2026-07-01',
    status: 'Sent',
    taxRate: 15,
    notes: 'Thank you for your business.',
    lineItems: [
      { id: crypto.randomUUID(), description: 'Website design', quantity: 1, unitPrice: 2500 },
      { id: crypto.randomUUID(), description: 'Hosting (12 months)', quantity: 12, unitPrice: 25 },
    ],
  },
];

export const db = {
  customers,
  senders,
  invoices,
  delay,
  paginate,
};
