import { apiClient } from '../../client';
import type { CustomerInputModel, CustomerModel } from '../../../models/customer';

export async function createCustomer(input: CustomerInputModel): Promise<CustomerModel> {
  const payload: CustomerModel = {
    id: 0,
    ...input,
    active: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  const { data } = await apiClient.post<CustomerModel>('/api/customers', payload);
  return data;
}
