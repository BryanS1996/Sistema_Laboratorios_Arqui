import { apiFetch } from './api';

export async function getSubjects() {
    return await apiFetch('/academic/subjects');
}

export async function createSubject(data) {
    return await apiFetch('/academic/subjects', {
        method: 'POST',
        body: data
    });
}

export async function deleteSubject(id) {
    return await apiFetch(`/academic/subjects/${id}`, {
        method: 'DELETE'
    });
}

export async function getParallelsBySubject(subjectId) {
    return await apiFetch(`/academic/subjects/${subjectId}/parallels`);
}

export async function createParallel(data) {
    return await apiFetch('/academic/parallels', {
        method: 'POST',
        body: data
    });
}

export async function deleteParallel(id) {
    return await apiFetch(`/academic/parallels/${id}`, {
        method: 'DELETE'
    });
}

// --- Laboratories ---
export async function getLaboratories() {
    return await apiFetch('/academic/laboratories');
}

export async function createLaboratory(data) {
    return await apiFetch('/academic/laboratories', {
        method: 'POST',
        body: data
    });
}

// --- Schedules ---
export async function getSchedules(parallelId = null) {
    const query = parallelId ? `?parallelId=${parallelId}` : '';
    return await apiFetch(`/academic/schedules${query}`);
}

export async function createSchedule(data) {
    return await apiFetch('/academic/schedules', {
        method: 'POST',
        body: data
    });
}
