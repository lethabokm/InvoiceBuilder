import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SenderInputModel } from '../../../models/sender';
import { sendersKey } from '../queries/useAllSenders';
import { createSender } from './createSender';
import { updateSender } from './updateSender';

export function useSaveSender() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id?: string; input: SenderInputModel }) =>
      id ? updateSender(id, input) : createSender(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [sendersKey] }),
  });
}
