import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../client';
import { sendersKey } from '../queries/useAllSenders';

async function deleteSender(email: string): Promise<void> {
  await apiClient.delete(`/api/senders/${encodeURIComponent(email)}`);
}

export function useDeleteSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => deleteSender(email),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [sendersKey] }),
  });
}
