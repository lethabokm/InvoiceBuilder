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
import { useSaveSender } from '../../api/sender/commands/useSaveSender';
import { emptySenderModel, type SenderInputModel, type SenderModel } from '../../models/sender';

export type FormMode = 'create' | 'edit' | 'view';

interface SenderFormDialogProps {
  open: boolean;
  mode: FormMode;
  sender?: SenderModel;
  onClose: () => void;
}

export function SenderFormDialog({ open, mode, sender, onClose }: SenderFormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {open && (
        <SenderFormFields
          key={sender?.id ?? 'new'}
          mode={mode}
          sender={sender}
          onClose={onClose}
        />
      )}
    </Dialog>
  );
}

interface SenderFormFieldsProps {
  mode: FormMode;
  sender?: SenderModel;
  onClose: () => void;
}

function SenderFormFields({ mode, sender, onClose }: SenderFormFieldsProps) {
  const [values, setValues] = useState<SenderInputModel>(
    sender
      ? {
          companyName: sender.companyName,
          contactPerson: sender.contactPerson,
          address: sender.address,
          email: sender.email,
          taxId: sender.taxId,
          phone: sender.phone,
          bankDetails: sender.bankDetails,
          active: sender.active,
          createdAt: sender.createdAt,
          modifiedAt: sender.modifiedAt,
        }
      : { ...emptySenderModel },
  );
  const saveSender = useSaveSender();
  const readOnly = mode === 'view';
  const isFormValid =
    values.companyName.trim().length > 0 &&
    values.taxId.trim().length > 0 &&
    values.contactPerson.trim().length > 0 &&
    values.email.trim().length > 0 &&
    values.phone.trim().length > 0 &&
    values.address.trim().length > 0 &&
    values.bankDetails.trim().length > 0;

  const handleChange =
    (field: keyof SenderInputModel) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async () => {
    await saveSender.mutateAsync({ id: sender?.email, input: values });
    onClose();
  };

  const title = mode === 'create' ? 'New Sender' : mode === 'edit' ? 'Edit Sender' : 'Sender';

  return (
    <>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {saveSender.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {getApiErrorMessage(saveSender.error, 'Failed to save sender.')}
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Company Name"
              value={values.companyName}
              onChange={handleChange('companyName')}
              fullWidth
              required
              slotProps={{ input: { readOnly } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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
              label="Phone"
              value={values.phone}
              onChange={handleChange('phone')}
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
          <Grid size={12}>
            <TextField
              label="Bank Details"
              value={values.bankDetails}
              onChange={handleChange('bankDetails')}
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
            disabled={!isFormValid || saveSender.isPending}
          >
            Save
          </Button>
        )}
      </DialogActions>
    </>
  );
}
