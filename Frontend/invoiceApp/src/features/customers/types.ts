export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  address: string;
  postalCode: string;
  taxId: string;
}

export type CustomerInput = Omit<Customer, 'id'>;

export const emptyCustomer: CustomerInput = {
  companyName: '',
  contactPerson: '',
  email: '',
  address: '',
  postalCode: '',
  taxId: '',
};
