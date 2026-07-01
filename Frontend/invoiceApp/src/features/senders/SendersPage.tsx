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
import { useDeleteSender } from '../../api/sender/commands/useDeleteSender';
import { useAllSenders } from '../../api/sender/queries/useAllSenders';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { SenderFormDialog, type FormMode } from './SenderFormDialog';
import type { SenderModel } from '../../models/sender';

export function SendersPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selected, setSelected] = useState<SenderModel | undefined>(undefined);
  const [toDelete, setToDelete] = useState<SenderModel | undefined>(undefined);

  const { data, isLoading, isError, error } = useAllSenders({
    page: page + 1,
    pageSize,
  });
  const deleteSender = useDeleteSender();
  const senders = data?.items ?? [];
  const total = data?.total ?? 0;

  const openForm = (mode: FormMode, sender?: SenderModel) => {
    setFormMode(mode);
    setSelected(sender);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (toDelete) {
      await deleteSender.mutateAsync(toDelete.email);
      setToDelete(undefined);
    }
  };

  return (
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Senders</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => openForm('create')}>
          New Sender
        </Button>
      </Box>

      {isError && (
        <Alert severity="error">{getApiErrorMessage(error, 'Failed to load senders.')}</Alert>
      )}

      {deleteSender.isError && (
        <Alert severity="error">
          {getApiErrorMessage(deleteSender.error, 'Failed to delete sender.')}
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
              <TableCell>Phone</TableCell>
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
            {!isLoading && senders.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  No senders yet.
                </TableCell>
              </TableRow>
            )}
            {senders.map((sender) => (
              <TableRow key={sender.id} hover>
                <TableCell>{sender.companyName}</TableCell>
                <TableCell>{sender.contactPerson}</TableCell>
                <TableCell>{sender.email}</TableCell>
                <TableCell>{sender.taxId}</TableCell>
                <TableCell>{sender.phone}</TableCell>
                <TableCell align="right">
                  <Tooltip title="View">
                    <IconButton size="small" onClick={() => openForm('view', sender)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openForm('edit', sender)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => setToDelete(sender)}>
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

      <SenderFormDialog
        open={formOpen}
        mode={formMode}
        sender={selected}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete sender"
        message={`Delete ${toDelete?.companyName}? This cannot be undone.`}
        loading={deleteSender.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(undefined)}
      />
    </Stack>
  );
}
