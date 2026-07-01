import type { EntityModel } from './entity';

export interface SenderModel extends EntityModel {
  phone: string;
  bankDetails: string;
}

export type SenderInputModel = Omit<SenderModel, 'id'>;

export const emptySenderModel: SenderInputModel = {
  companyName: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  taxId: '',
  bankDetails: '',
  active: true,
  createdAt: '',
  modifiedAt: '',
};
