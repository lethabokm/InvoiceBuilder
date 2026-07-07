# Invoice Builder

A full-stack invoice management application with a .NET Web API backend and a React + Vite frontend.

## Tech Stack

- Backend: ASP.NET Core Web API (.NET 10), Entity Framework Core, SQLite, Swagger/OpenAPI
- Frontend: React, TypeScript, Vite, Material UI, TanStack Query, Axios
- PDF: Playwright-based PDF generation service

## Repository Structure

- InvoiceBuilderAPI: backend API project
- Frontend/invoiceApp: frontend single-page app

## Prerequisites

Install these before first run:

- .NET SDK 10.x
- Node.js 20+ and npm
- Optional but recommended for migrations: dotnet-ef tool

### Install dotnet-ef (if needed)

Run once on your machine:

```powershell
dotnet tool install --global dotnet-ef
```

If already installed, update:

```powershell
dotnet tool update --global dotnet-ef
```

## First-Time Setup (Clean Clone)

### 1. Restore and run the backend

```powershell
cd InvoiceBuilderAPI
dotnet restore
dotnet run
```

What happens on first run:

- The app applies pending EF migrations automatically at startup.
- SQLite database is created at InvoiceBuilderAPI/Data/invoicebuilder.db.
- API starts with Swagger UI at https://localhost:xxxx/ (exact port shown in terminal).

Useful backend URLs:

- Swagger UI: https://localhost:7268

### 2. Restore and run the frontend

In a second terminal:

Create a local env file first:

- Create Frontend/invoiceApp/.env.local
- Add this line:

```text
VITE_API_BASE_URL=https://localhost:7268/
```

Then install and start the app:

```powershell
npm install
npm run dev
```

Then open the Vite URL shown in terminal (usually http://localhost:5173).

Notes:

- Backend CORS currently allows http://localhost:5173 (configured in InvoiceBuilderAPI/appsettings.json).
- If you change the frontend port, update Cors.AllowedOrigins accordingly.

### 3. Verify end-to-end startup

- Open frontend.
- Navigate to Senders, Customers, and Invoices.
- Create one Sender and one Customer.
- Create one Invoice and save.
- Confirm data appears in lists.

## Running for Day-to-Day Development

### Backend

```powershell
cd InvoiceBuilderAPI
dotnet run
```

### Frontend

```powershell
cd Frontend/invoiceApp
npm run dev
```

## Database and Migrations

### Where data is stored

- Main DB file: InvoiceBuilderAPI/Data/invoicebuilder.db
- SQLite runtime sidecar files: InvoiceBuilderAPI/Data/invoicebuilder.db-shm and InvoiceBuilderAPI/Data/invoicebuilder.db-wal

### Create a migration after model/config changes

```powershell
cd InvoiceBuilderAPI
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

### If migration is empty

An empty migration means EF did not detect schema differences between the current model snapshot and your current model/config.

## Pagination Behavior

List endpoints use server-side pagination and accept:

- page (1-based)
- pageSize (1..100)

Implemented for:

- GET /api/senders
- GET /api/customers
- GET /api/invoices

Frontend list pages request the active page/pageSize from the API and use returned total for pager counts.

## API Behavior Summary

- Senders and Customers:
  - Soft delete via Active = false
  - CRUD by email route key
- Invoices:
  - Server-generated invoice numbers (INV-{year}-{id})
  - Supports line items
  - PDF endpoint available at /api/invoices/{invoiceNumber}/pdf

## Common Troubleshooting

### Frontend cannot call API (CORS)

- Ensure frontend is running on allowed origin (default http://localhost:5173).
- Ensure Frontend/invoiceApp/.env.local exists and contains VITE_API_BASE_URL=https://localhost:7268/.
- Check InvoiceBuilderAPI/appsettings.json -> Cors.AllowedOrigins.

### Migration commands fail

- Verify dotnet-ef is installed.
- Run commands from InvoiceBuilderAPI folder.
- Ensure solution builds first: dotnet build.

### PDF generation fails first time

Playwright browser binaries may need install on some machines:

```powershell
cd InvoiceBuilderAPI
dotnet build
pwsh bin/Debug/net10.0/playwright.ps1 install
```

## Suggested Git Ignore Entries

If your root .gitignore does not exist yet, add:

```gitignore
# SQLite runtime data (backend)
InvoiceBuilderAPI/Data/*.db
InvoiceBuilderAPI/Data/*.db-shm
InvoiceBuilderAPI/Data/*.db-wal
```

## Quick Start Checklist

- Backend running and Swagger reachable
- Frontend running on 5173
- Migrations up to date
- Can create sender/customer/invoice
- Invoice list paging works across pages
