import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../client';
import type { StatusModel } from '../../../models/status';

export const statusesKey = 'statuses';

async function fetchAllStatuses(): Promise<StatusModel[]> {
  const { data } = await apiClient.get<StatusModel[]>('/api/statuses');
  return data;
}

export function useAllStatuses() {
  return useQuery({
    queryKey: [statusesKey, 'all'],
    queryFn: fetchAllStatuses,
  });
}
