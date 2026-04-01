import { QueryClient } from '@tanstack/react-query';

// Configuração otimizada do QueryClient
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache por 5 minutos por padrão
        staleTime: 5 * 60 * 1000,
        // Cache por 10 minutos
        gcTime: 10 * 60 * 1000,
        // Retry 2 vezes em caso de falha
        retry: 2,
        // Retry delay exponencial
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch em focus
        refetchOnWindowFocus: false,
        // Refetch em reconnect
        refetchOnReconnect: true,
        // Não refetchar em mount se dados estiverem fresh
        refetchOnMount: false,
        // Background updates
        refetchIntervalInBackground: false,
      },
      mutations: {
        // Retry mutations 1 vez
        retry: 1,
        // Retry delay
        retryDelay: 1000,
      },
    },
  });
};

// QueryClient singleton
let queryClient: QueryClient | null = null;

export const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

// Removed aggressive cache clearing that caused random refreshes
