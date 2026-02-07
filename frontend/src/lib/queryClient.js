import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query Client Configuration
 * 
 * This provides centralized data fetching, caching, and state management
 * for the entire application with adaptive polling support.
 */

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Stale time: how long data is considered fresh
            staleTime: 5 * 60 * 1000, // 5 minutes

            // Cache time: how long unused data stays in cache
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

            // Retry failed requests
            retry: 1,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus
            refetchOnWindowFocus: true,

            // Refetch on reconnect
            refetchOnReconnect: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false
        },
        mutations: {
            retry: 0 // Don't retry mutations by default
        }
    }
});

export default queryClient;
