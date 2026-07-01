import type { EntityModel } from './entity';

export interface CustomerModel extends EntityModel {
  postalCode: string;
}

export type CustomerInputModel = Omit<CustomerModel, 'id'>;

export const emptyCustomerModel: CustomerInputModel = {
  companyName: '',
  contactPerson: '',
  email: '',
  address: '',
  postalCode: '',
  taxId: '',
  active: true,
  createdAt: '',
  modifiedAt: '',
};
