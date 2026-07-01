import { useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import { getApiErrorMessage } from '../../api/getApiErrorMessage';
import { useSaveCustomer } from '../../api/customer/commands/useSaveCustomer';
import { emptyCustomerModel, type CustomerInputModel, type CustomerModel } from '../../models/customer';

export type FormMode = 'create' | 'edit' | 'view';

interface CustomerFormDialogProps {
  open: boolean;
  mode: FormMode;
  customer?: CustomerModel;
  onClose: () => void;
}

export function CustomerFormDialog({ open, mode, customer, onClose }: CustomerFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open && (
        <CustomerFormFields
          key={customer?.id ?? 'new'}
          mode={mode}
          customer={customer}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

interface CustomerFormFieldsProps {
  mode: FormMode;
  customer?: CustomerModel;
  onClose: () => void;
}

function CustomerFormFields({ mode, customer, onClose }: CustomerFormFieldsProps) {
  const [values, setValues] = useState<CustomerInputModel>(
    customer
      ? {
          companyName: customer.companyName,
          contactPerson: customer.contactPerson,
          address: customer.address,
          email: customer.email,
          taxId: customer.taxId,
          active: customer.active,
          createdAt: customer.createdAt,
          modifiedAt: customer.modifiedAt,
          postalCode: customer.postalCode,
        }
      : { ...emptyCustomerModel },
  );
  const saveCustomer = useSaveCustomer();
  const readOnly = mode === 'view';
  const isFormValid =
    values.companyName.trim().length > 0 &&
    values.contactPerson.trim().length > 0 &&
    values.email.trim().length > 0 &&
    values.taxId.trim().length > 0 &&
    values.address.trim().length > 0 &&
    values.postalCode.trim().length > 0;

  const handleChange =
    (field: keyof CustomerInputModel) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async () => {
    await saveCustomer.mutateAsync({ id: customer?.email, input: values });
    onClose();
  };

  const title = mode === 'create' ? 'New Customer' : mode === 'edit' ? 'Edit Customer' : 'Customer';

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {saveCustomer.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(saveCustomer.error, 'Failed to save customer.')}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={12}>
            <TextField
              label="Company Name"
              value={values.companyName}
              onChange={handleChange('companyName')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Contact Person"
              value={values.contactPerson}
              onChange={handleChange('contactPerson')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              value={values.email}
              onChange={handleChange('email')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Tax ID"
              value={values.taxId}
              onChange={handleChange('taxId')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              label="Address"
              value={values.address}
              onChange={handleChange('address')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Postal Code"
              value={values.postalCode}
              onChange={handleChange('postalCode')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{readOnly ? 'Close' : 'Cancel'}</Button>
        {!readOnly && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!isFormValid || saveCustomer.isPending}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </>
  );
}
