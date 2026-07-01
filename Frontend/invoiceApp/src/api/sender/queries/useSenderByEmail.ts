import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { SenderModel } from '../../../models/sender';
import { sendersKey } from './useAllSenders';

async function fetchSenderByEmail(email: string): Promise<SenderModel> {
  const { data } = await apiClient.get<SenderModel>(`/api/senders/${encodeURIComponent(email)}`);
  return data;
}

export function useSenderByEmail(email: string | undefined) {
  return useQuery({
    queryKey: [sendersKey, 'by-email', email],
    queryFn: () => fetchSenderByEmail(email as string),
    enabled: Boolean(email),
  });
}
