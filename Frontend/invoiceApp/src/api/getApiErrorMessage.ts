import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const payload = error.response?.data as unknown;

  if (typeof payload === 'string' && payload.trim() !== '') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;

    const title = typeof record.title === 'string' ? record.title : undefined;
    const detail = typeof record.detail === 'string' ? record.detail : undefined;

    if (record.errors && typeof record.errors === 'object') {
      const entries = Object.values(record.errors as Record<string, unknown>);
      const firstArray = entries.find((value) => Array.isArray(value)) as unknown[] | undefined;
      const firstMessage = firstArray?.find((value) => typeof value === 'string') as
        | string
        | undefined;

      if (firstMessage) {
        return firstMessage;
      }
    }

    if (detail && title) {
      return `${title}: ${detail}`;
    }

    if (detail) {
      return detail;
    }

    if (title) {
      return title;
    }
  }

  return error.message || fallback;
}
