import { apiClient } from '../../client';
import type { CustomerInputModel, CustomerModel } from '../../../models/customer';

export async function updateCustomer(email: string, input: CustomerInputModel): Promise<CustomerModel> {
  const payload: CustomerModel = {
    id: 0,
    ...input,
    active: true,
    createdAt: input.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  const { data } = await apiClient.put<CustomerModel>(`/api/customers/${encodeURIComponent(email)}`, payload);
  return data;
}
