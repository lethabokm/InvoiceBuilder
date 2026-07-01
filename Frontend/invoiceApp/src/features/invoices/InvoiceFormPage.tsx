import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAllCustomers } from '../../api/customer/queries/useAllCustomers';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { openInvoicePdf } from '../../api/invoice/commands/openInvoicePdf';
import { useSaveInvoiceInput } from '../../api/invoice/commands/useSaveInvoiceInput';
import { useInvoice } from '../../api/invoice/queries/useInvoice';
import { useAllSenders } from '../../api/sender/queries/useAllSenders';
import type { CustomerModel } from '../../models/customer';
import type { SenderModel } from '../../models/sender';
import { calculateLineTotal, calculateTotals, formatCurrency } from './calculations';
import {
  buildEmptyInvoice,
  emptyLineItem,
  invoiceStatuses,
  toInvoiceInput,
  type InvoiceInput,
  type InvoiceLineItem,
} from './types';

export function InvoiceFormPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const isReadOnly = searchParams.get('mode') === 'view';

  const { data: existing, isLoading, isError, error } = useInvoice(id);
  const customersQuery = useAllCustomers();
  const sendersQuery = useAllSenders();
  const customers = customersQuery.data?.items ?? [];
  const senders = sendersQuery.data?.items ?? [];

  if (isEdit && isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isEdit && isError) {
    return (
      <Alert severity="error">{getApiErrorMessage(error, 'Failed to load invoice details.')}</Alert>
    );
  }

  if (customersQuery.isError || sendersQuery.isError) {
    return (
      <Alert severity="error">
        {getApiErrorMessage(
          customersQuery.error ?? sendersQuery.error,
          'Failed to load customers or senders.',
        )}
      </Alert>
    );
  }

  return (
    <InvoiceForm
      key={existing?.id ?? 'new'}
      invoiceId={id}
      isEdit={isEdit}
      isReadOnly={isReadOnly}
      initialValues={existing ? toInvoiceInput(existing) : buildEmptyInvoice()}
      customers={customers}
      senders={senders}
    />
  );
}

interface InvoiceFormProps {
  invoiceId?: string;
  isEdit: boolean;
  isReadOnly: boolean;
  initialValues: InvoiceInput;
  customers: CustomerModel[];
  senders: SenderModel[];
}

function InvoiceForm({
  invoiceId,
  isEdit,
  isReadOnly,
  initialValues,
  customers,
  senders,
}: InvoiceFormProps) {
  const navigate = useNavigate();
  const saveInvoice = useSaveInvoiceInput();
  const [values, setValues] = useState<InvoiceInput>(initialValues);
  const invoiceNumberDisplay = isEdit ? values.invoiceNumber : '--';

  const totals = useMemo(
    () => calculateTotals(values.lineItems, values.taxRate),
    [values.lineItems, values.taxRate],
  );

  const setField = <K extends keyof InvoiceInput>(field: K, value: InvoiceInput[K]) =>
    setValues((current) => ({ ...current, [field]: value }));

  const updateLineItem = (
    lineId: string,
    field: keyof Omit<InvoiceLineItem, 'id'>,
    value: string | number,
  ) =>
    setValues((current) => ({
      ...current,
      lineItems: current.lineItems.map((item) =>
        item.id === lineId ? { ...item, [field]: value } : item,
      ),
    }));

  const addLineItem = () =>
    setValues((current) => ({ ...current, lineItems: [...current.lineItems, emptyLineItem()] }));

  const removeLineItem = (lineId: string) =>
    setValues((current) => ({
      ...current,
      lineItems: current.lineItems.filter((item) => item.id !== lineId),
    }));

  const handleSave = async () => {
    if (isReadOnly) {
      return;
    }

    await saveInvoice.mutateAsync({ id: invoiceId, input: values });
    navigate('/invoices');
  };

  const handleDownloadPdf = () => {
    if (!invoiceId) {
      return;
    }

    openInvoicePdf(invoiceId);
  };

  const canSave =
    !isReadOnly &&
    values.customerId !== '' &&
    values.senderId !== '' &&
    values.lineItems.length > 0 &&
    !saveInvoice.isPending;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={() => navigate('/invoices')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">
            {isReadOnly ? 'View Invoice' : isEdit ? 'Edit Invoice' : 'New Invoice'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<PictureAsPdfIcon />}
            variant="outlined"
            onClick={handleDownloadPdf}
            disabled={!invoiceId}
          >
            Download PDF
          </Button>
          {!isReadOnly && (
            <Button variant="contained" onClick={handleSave} disabled={!canSave}>
              Save
            </Button>
          )}
        </Stack>
      </Box>

      {saveInvoice.isError && (
        <Alert severity="error">{getApiErrorMessage(saveInvoice.error, 'Failed to save invoice.')}</Alert>
      )}

      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Invoice Number"
                value={invoiceNumberDisplay}
                fullWidth
                slotProps={{ input: { readOnly: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Issue Date"
                type="date"
                value={values.issueDate}
                onChange={(event) => setField('issueDate', event.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: isReadOnly } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Due Date"
                type="date"
                value={values.dueDate}
                onChange={(event) => setField('dueDate', event.target.value)}
                fullWidth
                slotProps={{ inputLabel: { shrink: true }, input: { readOnly: isReadOnly } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Sender"
                value={values.senderId}
                onChange={(event) => setField('senderId', event.target.value)}
                fullWidth
                required
                disabled={isReadOnly}
              >
                {senders.map((sender) => (
                  <MenuItem key={sender.email} value={sender.email}>
                    {sender.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Customer"
                value={values.customerId}
                onChange={(event) => setField('customerId', event.target.value)}
                fullWidth
                required
                disabled={isReadOnly}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.email} value={customer.email}>
                    {customer.companyName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                label="Status"
                value={values.status}
                onChange={(event) =>
                  setField('status', event.target.value as InvoiceInput['status'])
                }
                fullWidth
                disabled={isReadOnly}
              >
                {invoiceStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">Line Items</Typography>
            <Button startIcon={<AddIcon />} onClick={addLineItem} disabled={isReadOnly}>
              Add Item
            </Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '45%' }}>Description</TableCell>
                <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
                <TableCell sx={{ width: '20%' }}>Unit Price</TableCell>
                <TableCell sx={{ width: '15%' }} align="right">
                  Amount
                </TableCell>
                <TableCell sx={{ width: '5%' }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {values.lineItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <TextField
                      value={item.description}
                      onChange={(event) => updateLineItem(item.id, 'description', event.target.value)}
                      fullWidth
                      variant="standard"
                      placeholder="Item description"
                      slotProps={{ input: { readOnly: isReadOnly } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        updateLineItem(item.id, 'quantity', nextValue === '' ? 0 : Number(nextValue));
                      }}
                      variant="standard"
                      slotProps={{ input: { readOnly: isReadOnly }, htmlInput: { min: 0 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.unitPrice === 0 ? '' : item.unitPrice}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        updateLineItem(item.id, 'unitPrice', nextValue === '' ? 0 : Number(nextValue));
                      }}
                      variant="standard"
                      slotProps={{
                        input: { readOnly: isReadOnly },
                        htmlInput: { min: 0, step: 0.01 },
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatCurrency(calculateLineTotal(item))}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeLineItem(item.id)}
                      disabled={isReadOnly || values.lineItems.length === 1}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <TextField
            label="Notes"
            value={values.notes}
            onChange={(event) => setField('notes', event.target.value)}
            fullWidth
            multiline
            minRows={4}
            slotProps={{ input: { readOnly: isReadOnly } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(totals.subtotal)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography color="text.secondary">Tax</Typography>
                  <TextField
                    type="number"
                    value={values.taxRate === 0 ? '' : values.taxRate}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setField('taxRate', nextValue === '' ? 0 : Number(nextValue));
                    }}
                    variant="standard"
                    sx={{ width: 70 }}
                    slotProps={{
                      input: { readOnly: isReadOnly },
                      htmlInput: { min: 0, step: 0.5 },
                    }}
                  />
                  <Typography color="text.secondary">%</Typography>
                </Box>
                <Typography>{formatCurrency(totals.tax)}</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">{formatCurrency(totals.total)}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
