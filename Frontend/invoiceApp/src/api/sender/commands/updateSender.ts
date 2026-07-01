import { apiClient } from '../../client';
import type { SenderInputModel, SenderModel } from '../../../models/sender';

export async function updateSender(email: string, input: SenderInputModel): Promise<SenderModel> {
  const payload: SenderModel = {
    id: 0,
    ...input,
    active: true,
    createdAt: input.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  };
  const { data } = await apiClient.put<SenderModel>(`/api/senders/${encodeURIComponent(email)}`, payload);
  return data;
}
