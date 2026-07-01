import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { CustomersPage } from './features/customers/CustomersPage'
import { InvoiceFormPage } from './features/invoices/InvoiceFormPage'
import { InvoicesPage } from './features/invoices/InvoicesPage'
import { SendersPage } from './features/senders/SendersPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/invoices" replace />} />
        <Route path="invoices" element={<InvoicesPage />} />
        <Route path="invoices/new" element={<InvoiceFormPage />} />
        <Route path="invoices/:id" element={<InvoiceFormPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="senders" element={<SendersPage />} />
        <Route path="*" element={<Navigate to="/invoices" replace />} />
      </Route>
    </Routes>
  )
}

export default App
