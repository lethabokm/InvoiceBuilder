using System.Globalization;
using System.Text;
using InvoiceBuilderAPI.Models;
using Microsoft.Playwright;

namespace InvoiceBuilderAPI.Services.Pdf
{
    public class PlaywrightInvoicePdfService : IInvoicePdfService
    {
        public async Task<byte[]> GenerateInvoicePdfAsync(Invoice invoice, Customer customer, Sender sender, CancellationToken cancellationToken)
        {
            using var playwright = await Playwright.CreateAsync();
            await using var browser = await playwright.Chromium.LaunchAsync(new BrowserTypeLaunchOptions
            {
                Headless = true
            });

            var page = await browser.NewPageAsync();
            await page.SetContentAsync(BuildHtml(invoice, customer, sender), new PageSetContentOptions
            {
                WaitUntil = WaitUntilState.Load
            });

            return await page.PdfAsync(new PagePdfOptions
            {
                Format = "A4",
                PrintBackground = true,
                Margin = new Margin
                {
                    Top = "20mm",
                    Right = "15mm",
                    Bottom = "20mm",
                    Left = "15mm"
                }
            });
        }

        private static string BuildHtml(Invoice invoice, Customer customer, Sender sender)
        {
            var culture = CultureInfo.InvariantCulture;
            var subtotal = invoice.InvoiceLineItems.Sum(item => item.Total);
            var taxAmount = subtotal * (invoice.TaxRate / 100m);
            var total = subtotal + taxAmount;
            var paymentInstructions = $"Bank details (IBAN): {sender.BankDetails}";

            var rows = new StringBuilder();
            foreach (var item in invoice.InvoiceLineItems)
            {
                rows.Append($@"
                    <tr>
                        <td>{Encode(item.Description)}</td>
                        <td class='num'>{item.Quantity}</td>
                        <td class='num'>{item.UnitPrice.ToString("0.00", culture)}</td>
                        <td class='num'>{item.Total.ToString("0.00", culture)}</td>
                    </tr>");
            }

            return $@"
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='utf-8' />
    <title>{Encode(invoice.InvoiceNumber)}</title>
    <style>
        body {{ font-family: Arial, Helvetica, sans-serif; color: #1f2937; font-size: 14px; margin: 0; }}
        .page {{ padding: 12px 4px; }}
        .header {{ display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }}
        .brand-title {{ font-size: 24px; font-weight: 700; margin: 0 0 10px; }}
        .invoice-title {{ font-size: 30px; font-weight: 700; margin: 0; text-align: right; }}
        .muted {{ color: #6b7280; }}
        .section-title {{ font-size: 12px; text-transform: uppercase; color: #6b7280; margin: 0 0 8px; letter-spacing: 0.04em; }}
        .two-col {{ display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-bottom: 24px; }}
        .meta-grid {{ display: grid; grid-template-columns: 160px 1fr; row-gap: 6px; column-gap: 12px; margin-top: 8px; }}
        .meta-label {{ color: #6b7280; font-weight: 600; }}
        .panel {{ border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }}
        .spacer {{ height: 10px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 12px; }}
        th, td {{ border-bottom: 1px solid #e5e7eb; padding: 10px 8px; text-align: left; vertical-align: top; }}
        th {{ background: #f9fafb; font-size: 12px; text-transform: uppercase; color: #6b7280; }}
        .num {{ text-align: right; }}
        .totals {{ width: 340px; margin-left: auto; margin-top: 20px; }}
        .totals td {{ border: none; padding: 6px 8px; }}
        .totals .label {{ color: #6b7280; }}
        .totals .grand {{ font-size: 18px; font-weight: 700; }}
        .summary-section {{ margin-top: 20px; }}
        .notes, .payment {{ margin-top: 24px; white-space: pre-wrap; }}
        .address-line {{ margin: 2px 0; }}
    </style>
</head>
<body>
    <div class='page'>
        <div class='header'>
            <div>
                <h1 class='brand-title'>{Encode(sender.CompanyName)}</h1>
                <div class='address-line'>{Encode(sender.ContactPerson)}</div>
                <div class='address-line'>{Encode(sender.Address)}</div>
                <div class='address-line'>{Encode(sender.Email)}</div>
                <div class='address-line'>{Encode(sender.Phone)}</div>
                <div class='address-line'>Tax ID: {Encode(sender.TaxId)}</div>
            </div>
            <div>
                <h1 class='invoice-title'>INVOICE</h1>
                <div class='meta-grid'>
                    <div class='meta-label'>Invoice Number</div>
                    <div>{Encode(invoice.InvoiceNumber)}</div>
                    <div class='meta-label'>Invoice Date</div>
                    <div>{invoice.InvoiceDate:yyyy-MM-dd}</div>
                    <div class='meta-label'>Due Date</div>
                    <div>{invoice.DueDate:yyyy-MM-dd}</div>
                    <div class='meta-label'>Currency</div>
                    <div>{Encode(invoice.Currency)}</div>
                </div>
            </div>
        </div>

        <div class='two-col'>
            <div class='panel'>
                <div class='section-title'>Billed From</div>
                <div><strong>{Encode(sender.CompanyName)}</strong></div>
                <div class='address-line'>{Encode(sender.ContactPerson)}</div>
                <div class='address-line'>{Encode(sender.Address)}</div>
                <div class='address-line'>{Encode(sender.Email)}</div>
            </div>
            <div class='panel'>
                <div class='section-title'>Billed To</div>
                <div><strong>{Encode(customer.CompanyName)}</strong></div>
                <div class='address-line'>{Encode(customer.ContactPerson)}</div>
                <div class='address-line'>{Encode(customer.Address)}</div>
                <div class='address-line'>{Encode(customer.Email)}</div>
                <div class='address-line'>Postal Code: {Encode(customer.PostalCode)}</div>
                <div class='address-line'>Tax ID: {Encode(customer.TaxId)}</div>
            </div>
        </div>

        <div class='section-title'>Line Items</div>
        <table>
            <thead>
                <tr>
                    <th>Description</th>
                    <th class='num'>Quantity</th>
                    <th class='num'>Unit Price</th>
                    <th class='num'>Line Total</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>

        <div class='summary-section'>
            <div class='section-title'>Summary</div>
            <table class='totals'>
                <tr>
                    <td class='label'>Subtotal</td>
                    <td class='num'>{subtotal.ToString("0.00", culture)}</td>
                </tr>
                <tr>
                    <td class='label'>Tax ({invoice.TaxRate.ToString("0.##", culture)}%)</td>
                    <td class='num'>{taxAmount.ToString("0.00", culture)}</td>
                </tr>
                <tr>
                    <td class='grand'>Total</td>
                    <td class='num grand'>{total.ToString("0.00", culture)}</td>
                </tr>
            </table>
        </div>

        <div class='payment'>
            <div class='section-title'>Bank Details</div>
            <div>{Encode(paymentInstructions)}</div>
        </div>

        <div class='notes'>
            <div class='section-title'>Notes</div>
            <div>{Encode(invoice.Notes)}</div>
        </div>
    </div>
</body>
</html>";
        }

        private static string Encode(string value)
        {
            return System.Net.WebUtility.HtmlEncode(value ?? string.Empty);
        }
    }
}
