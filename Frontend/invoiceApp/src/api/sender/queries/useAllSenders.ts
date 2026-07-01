import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { PagedResult, PageRequest } from '../../types';
import type { SenderModel } from '../../../models/sender';

export const sendersKey = 'senders';

async function fetchAllSenders(request: PageRequest): Promise<PagedResult<SenderModel>> {
  const { data } = await apiClient.get<PagedResult<SenderModel>>('/api/senders', {
    params: request,
  });
  return data;
}

export function useAllSenders(request: PageRequest = { page: 1, pageSize: 100 }) {
  return useQuery({
    queryKey: [sendersKey, 'all', request.page, request.pageSize],
    queryFn: () => fetchAllSenders(request),
  });
}
