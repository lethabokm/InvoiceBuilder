export interface Sender {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  bankDetails: string;
}

export type SenderInput = Omit<Sender, 'id'>;

export const emptySender: SenderInput = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
  bankDetails: '',
};
