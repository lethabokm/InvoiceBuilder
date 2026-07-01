export function openInvoicePdf(invoiceNumber: string): void {
  const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');
  const rootBase = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const path = `/api/invoices/${encodeURIComponent(invoiceNumber)}/pdf`;

  window.open(`${rootBase}${path}`, '_blank');
}
