import { apiClient } from '../../client';
import type { SenderInputModel, SenderModel } from '../../../models/sender';

export async function createSender(input: SenderInputModel): Promise<SenderModel> {
  const payload: SenderModel = {
    id: 0,
    ...input,
    active: true,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  const { data } = await apiClient.post<SenderModel>('/api/senders', payload);
  return data;
}
