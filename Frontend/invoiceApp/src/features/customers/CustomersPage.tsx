import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useDeleteCustomer } from '../../api/customer/commands/useDeleteCustomer';
import { useAllCustomers } from '../../api/customer/queries/useAllCustomers';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { CustomerFormDialog, type FormMode } from './CustomerFormDialog';
import type { CustomerModel } from '../../models/customer';

export function CustomersPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selected, setSelected] = useState<CustomerModel | undefined>(undefined);
  const [toDelete, setToDelete] = useState<CustomerModel | undefined>(undefined);

  const { data, isLoading, isError, error } = useAllCustomers({
    page: page + 1,
    pageSize,
  });
  const deleteCustomer = useDeleteCustomer();
  const customers = data?.items ?? [];
  const total = data?.total ?? 0;

  const openForm = (mode: FormMode, customer?: CustomerModel) => {
    setFormMode(mode);
    setSelected(customer);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (toDelete) {
      await deleteCustomer.mutateAsync(toDelete.email);
      setToDelete(undefined);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Customers</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => openForm('create')}>
          New Customer
        </Button>
      </Box>

      {isError && (
        <Alert severity="error">{getApiErrorMessage(error, 'Failed to load customers.')}</Alert>
      )}

      {deleteCustomer.isError && (
        <Alert severity="error">
          {getApiErrorMessage(deleteCustomer.error, 'Failed to delete customer.')}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company Name</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Tax ID</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            )}
            {!isLoading && customers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No customers yet.
                </TableCell>
              </TableRow>
            )}
            {customers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>{customer.companyName}</TableCell>
                <TableCell>{customer.contactPerson}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.taxId}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => openForm('view', customer)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openForm('edit', customer)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setToDelete(customer)}>
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

      <CustomerFormDialog
        open={formOpen}
        mode={formMode}
        customer={selected}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete customer"
        message={`Delete ${toDelete?.companyName}? This cannot be undone.`}
        loading={deleteCustomer.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </Stack>
  );
}
