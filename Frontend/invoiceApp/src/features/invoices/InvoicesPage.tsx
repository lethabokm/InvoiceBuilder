import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useNavigate } from 'react-router-dom';
import { openInvoicePdf } from '../../api/invoice/commands/openInvoicePdf';
import { useDeleteInvoice } from '../../api/invoice/commands/useDeleteInvoice';
import { useInvoiceSummaries } from '../../api/invoice/queries/useInvoiceSummaries';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatCurrency } from './calculations';
import type { InvoiceSummary } from './types';

function statusColor(status: InvoiceSummary['status']) {
  if (status === 'Draft') {
    return 'primary';
  }
  if (status === 'Paid') {
    return 'success';
  }
  if (status === 'Sent') {
    return 'warning';
  }
  return 'default';
}

export function InvoicesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [toDelete, setToDelete] = useState<InvoiceSummary | undefined>(undefined);

  const { items: invoices, total, isLoading, isError, error } = useInvoiceSummaries({
    page: page + 1,
    pageSize,
  });
  const deleteInvoice = useDeleteInvoice();

  const confirmDelete = async () => {
    if (toDelete) {
      await deleteInvoice.mutateAsync(toDelete.invoiceNumber);
      setToDelete(undefined);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Invoices</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => navigate('/invoices/new')}>
          New Invoice
        </Button>
      </Box>

      {isError && (
        <Alert severity="error">{getApiErrorMessage(error, 'Failed to load invoices.')}</Alert>
      )}

      {deleteInvoice.isError && (
        <Alert severity="error">
          {getApiErrorMessage(deleteInvoice.error, 'Failed to delete invoice.')}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Sender</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
            {invoices.map((invoice) => (
              <TableRow key={invoice.id} hover>
                <TableCell>{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell>{invoice.senderName}</TableCell>
                <TableCell>{invoice.issueDate}</TableCell>
                <TableCell>{invoice.dueDate}</TableCell>
                <TableCell>
                  <Chip
                    label={invoice.status}
                    size="small"
                    color={statusColor(invoice.status)}
                    variant="filled"
                  />
                </TableCell>
                <TableCell align="right">{formatCurrency(invoice.total)}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(
                          `/invoices/${encodeURIComponent(invoice.invoiceNumber)}?mode=view`,
                        )
                      }
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/invoices/${encodeURIComponent(invoice.invoiceNumber)}`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <IconButton
                      size="small"
                      onClick={() => openInvoicePdf(invoice.invoiceNumber)}
                    >
                      <PictureAsPdfIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setToDelete(invoice)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete invoice"
        message={`Delete ${toDelete?.invoiceNumber}? This cannot be undone.`}
        loading={deleteInvoice.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </Stack>
  );
}
