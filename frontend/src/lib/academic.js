import { apiFetch } from './api';

export async function getSemesters() {
    return await apiFetch('/academic/semesters', { auth: false });
}

export async function getParallelNamesBySemester(semesterId) {
    return await apiFetch(`/academic/semesters/${semesterId}/parallels`, { auth: false });
}

export async function getSubjects() {
    return await apiFetch('/academic/subjects');
}

export async function getAllSubjects() {
    return await apiFetch('/academic/subjects/catalog', { auth: false });
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

export async function updateLaboratory(id, data) {
    return await apiFetch(`/academic/laboratories/${id}`, {
        method: 'PUT',
        body: data
    });
}

export async function deleteLaboratory(id) {
    return await apiFetch(`/academic/laboratories/${id}`, {
        method: 'DELETE'
    });
}

// --- Schedules ---
export async function getSchedules(parallelId = null, labId = null) {
    let query = '';
    if (parallelId) query = `?parallelId=${parallelId}`;
    else if (labId) query = `?labId=${labId}`;

    return await apiFetch(`/academic/schedules${query}`);
}

export async function createSchedule(data) {
    return await apiFetch('/academic/schedules', {
        method: 'POST',
        body: data
    });
}

// --- Generation ---
export async function generateReservations(startDate, endDate, scheduleId = null) {
    return await apiFetch('/academic/generate-reservations', {
        method: 'POST',
        body: { startDate, endDate, scheduleId }
    });
}
