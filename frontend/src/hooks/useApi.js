import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePolling } from './usePolling';
import { apiFetch } from '../lib/api';

/**
 * Obtener reservaciones con polling adaptativo
 */
export function useReservations(enabled = true) {
    const query = useQuery({
        queryKey: ['reservations'],
        queryFn: async () => {
            const data = await apiFetch('/reservas/mine');
            return data;
        },
        enabled
    });

    // Activar polling adaptativo
    usePolling(
        'reservations',
        () => query.refetch(),
        enabled && !query.isLoading
    );

    return query;
}

/**
 * Crear una reservación
 */
export function useCreateReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reservationData) => {
            return await apiFetch('/reservas', {
                method: 'POST',
                body: reservationData
            });
        },
        onSuccess: () => {
            // Invalidar y refrescar reservaciones
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
    });
}

/**
 * Eliminar una reservación
 */
export function useDeleteReservation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reservationId) => {
            return await apiFetch(`/reservas/${reservationId}`, {
                method: 'DELETE'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        }
    });
}

/**
 * Obtener notificaciones con polling
 */
export function useNotifications(enabled = true) {
    const query = useQuery({
        queryKey: ['notifications'],
        queryFn: async () => {
            // TODO: Crear endpoint de notificaciones
            return await apiFetch('/notifications');
        },
        enabled
    });

    // Hacer polling de notificaciones más frecuentemente
    usePolling(
        'notifications',
        () => query.refetch(),
        enabled && !query.isLoading,
        3000 // Sobrescribir: 3 segundos para notificaciones
    );

    return query;
}

/**
 * Obtener analytics del dashboard con polling
 */
export function useDashboardAnalytics(enabled = true) {
    const query = useQuery({
        queryKey: ['dashboard', 'analytics'],
        queryFn: async () => {
            // TODO: Crear endpoint de analytics
            return await apiFetch('/dashboard/analytics');
        },
        enabled,
        staleTime: 30000 // 30 segundos - los analytics no necesitan ser súper frescos
    });

    // Hacer polling de analytics
    usePolling(
        'dashboard-analytics',
        () => query.refetch(),
        enabled && !query.isLoading
    );

    return query;
}
