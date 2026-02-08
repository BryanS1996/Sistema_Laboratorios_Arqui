import { useState, useEffect } from 'react';
import {
    getSubjects, createSubject, deleteSubject,
    getParallelsBySubject, createParallel, deleteParallel,
    getLaboratories, createLaboratory,
    getSchedules, createSchedule
} from '../lib/academic';

import AppLayout from '../components/AppLayout'

export default function AcademicManagement() {
    // ... existing state ...
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', description: '' });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [parallels, setParallels] = useState([]);
    const [newParallel, setNewParallel] = useState({ name: '' });
    const [selectedParallel, setSelectedParallel] = useState(null); // New

    // Labs State
    const [laboratories, setLaboratories] = useState([]);
    const [newLab, setNewLab] = useState({ nombre: '', capacidad: '', ubicacion: '' });

    // Schedules State
    const [schedules, setSchedules] = useState([]);
    const [newSchedule, setNewSchedule] = useState({
        dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00', labId: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSubjects();
        loadLaboratories();
    }, []);

    // ... useEffects for parallels/schedules ...
    useEffect(() => {
        if (selectedSubject) {
            loadParallels(selectedSubject.id);
            setSelectedParallel(null);
        } else {
            setParallels([]);
        }
    }, [selectedSubject]);

    useEffect(() => {
        if (selectedParallel) {
            loadSchedules(selectedParallel.id);
        } else {
            setSchedules([]);
        }
    }, [selectedParallel]);

    // ... handlers ...
    async function loadSubjects() { /* ... */
        try { setLoading(true); setSubjects(await getSubjects()); } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
    async function loadLaboratories() {
        try { setLaboratories(await getLaboratories()); } catch (err) { setError(err.message); }
    }
    async function loadParallels(subjectId) {
        try { setLoading(true); setParallels(await getParallelsBySubject(subjectId)); } catch (err) { setError(err.message); } finally { setLoading(false); }
    }
    async function loadSchedules(parallelId) {
        try { setSchedules(await getSchedules(parallelId)); } catch (err) { setError(err.message); }
    }

    async function handleAddSubject(e) {
        e.preventDefault();
        if (!newSubject.name) return;
        try { await createSubject(newSubject); setNewSubject({ name: '', description: '' }); loadSubjects(); } catch (err) { setError(err.message); }
    }
    async function handleDeleteSubject(id) {
        if (!window.confirm('Delete?')) return;
        try { await deleteSubject(id); if (selectedSubject?.id === id) setSelectedSubject(null); loadSubjects(); } catch (err) { setError(err.message); }
    }
    async function handleAddParallel(e) {
        e.preventDefault();
        if (!newParallel.name || !selectedSubject) return;
        try { await createParallel({ ...newParallel, subjectId: selectedSubject.id }); setNewParallel({ name: '' }); loadParallels(selectedSubject.id); } catch (err) { setError(err.message); }
    }
    async function handleDeleteParallel(id) {
        if (!window.confirm('Delete?')) return;
        try { await deleteParallel(id); loadParallels(selectedSubject.id); } catch (err) { setError(err.message); }
    }

    // New Handlers
    async function handleAddLab(e) {
        e.preventDefault();
        try {
            await createLaboratory(newLab);
            setNewLab({ nombre: '', capacidad: '', ubicacion: '' });
            loadLaboratories();
        } catch (err) { setError(err.message); }
    }

    async function handleAddSchedule(e) {
        e.preventDefault();
        if (!selectedParallel || !newSchedule.labId) return;
        try {
            await createSchedule({ ...newSchedule, parallelId: selectedParallel.id });
            loadSchedules(selectedParallel.id);
        } catch (err) { setError(err.message); }
    }

    return (
        <AppLayout>
            <div>
                <h1 className="text-2xl font-bold mb-6">Gestión Académica</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error} <button onClick={() => setError('')} className="ml-2 font-bold">x</button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 1. Subjects Panel */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">1. Asignaturas</h2>
                        <form onSubmit={handleAddSubject} className="mb-4 flex gap-2">
                            <input type="text" placeholder="Nombre" className="border p-2 rounded flex-1" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} />
                            <button className="bg-blue-600 text-white px-3 py-2 rounded">+</button>
                        </form>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {subjects.map(sub => (
                                <div key={sub.id}
                                    className={`p-2 border rounded cursor-pointer flex justify-between ${selectedSubject?.id === sub.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                    onClick={() => setSelectedSubject(sub)}>
                                    <span>{sub.name}</span>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id) }} className="text-red-500">🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 2. Parallels Panel */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">2. Paralelos {selectedSubject ? `de ${selectedSubject.name}` : ''}</h2>
                        {selectedSubject ? (
                            <>
                                <form onSubmit={handleAddParallel} className="mb-4 flex gap-2">
                                    <input type="text" placeholder="Nombre (e.g. P1)" className="border p-2 rounded flex-1" value={newParallel.name} onChange={e => setNewParallel({ ...newParallel, name: e.target.value })} />
                                    <button className="bg-green-600 text-white px-3 py-2 rounded">+</button>
                                </form>
                                <div className="space-y-2">
                                    {parallels.map(par => (
                                        <div key={par.id}
                                            className={`p-2 border rounded cursor-pointer flex justify-between ${selectedParallel?.id === par.id ? 'bg-green-50 border-green-500' : 'hover:bg-gray-50'}`}
                                            onClick={() => setSelectedParallel(par)}>
                                            <span>{par.name}</span>
                                            <button onClick={() => handleDeleteParallel(par.id)} className="text-red-500">🗑️</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : <p className="text-gray-500">Selecciona una asignatura.</p>}
                    </div>

                    {/* 3. Laboratories Panel (Global) */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">3. Laboratorios (Global)</h2>
                        <form onSubmit={handleAddLab} className="mb-4 grid grid-cols-2 gap-2">
                            <input type="text" placeholder="Nombre" className="border p-2 rounded" value={newLab.nombre} onChange={e => setNewLab({ ...newLab, nombre: e.target.value })} />
                            <input type="number" placeholder="Cap." className="border p-2 rounded" value={newLab.capacidad} onChange={e => setNewLab({ ...newLab, capacidad: e.target.value })} />
                            <input type="text" placeholder="Ubicación" className="border p-2 rounded col-span-2" value={newLab.ubicacion} onChange={e => setNewLab({ ...newLab, ubicacion: e.target.value })} />
                            <button className="bg-purple-600 text-white px-3 py-2 rounded col-span-2">Crear Laboratorio</button>
                        </form>
                        <div className="space-y-1 max-h-40 overflow-y-auto">
                            {laboratories.map(lab => (
                                <div key={lab.id} className="p-2 border rounded text-sm flex justify-between">
                                    <span>{lab.nombre} ({lab.capacidad} cap)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Schedules Panel (Per Parallel) */}
                    <div className="bg-white p-6 rounded shadow">
                        <h2 className="text-xl font-semibold mb-4">4. Horarios {selectedParallel ? `de ${selectedParallel.name}` : ''}</h2>
                        {selectedParallel ? (
                            <>
                                <form onSubmit={handleAddSchedule} className="mb-4 space-y-2">
                                    <div className="flex gap-2">
                                        <select className="border p-2 rounded flex-1" value={newSchedule.labId} onChange={e => setNewSchedule({ ...newSchedule, labId: e.target.value })}>
                                            <option value="">Seleccionar Lab</option>
                                            {laboratories.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                                        </select>
                                        <select className="border p-2 rounded" value={newSchedule.dia} onChange={e => setNewSchedule({ ...newSchedule, dia: e.target.value })}>
                                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="time" className="border p-2 rounded flex-1" value={newSchedule.horaInicio} onChange={e => setNewSchedule({ ...newSchedule, horaInicio: e.target.value })} />
                                        <input type="time" className="border p-2 rounded flex-1" value={newSchedule.horaFin} onChange={e => setNewSchedule({ ...newSchedule, horaFin: e.target.value })} />
                                        <button className="bg-orange-600 text-white px-3 py-2 rounded">Asignar</button>
                                    </div>
                                </form>

                                <div className="space-y-2">
                                    {schedules.map(sch => (
                                        <div key={sch.id} className="p-2 border rounded bg-orange-50 text-sm">
                                            <b>{sch.dia}:</b> {sch.hora_inicio} - {sch.hora_fin} en {sch.lab_name}
                                        </div>
                                    ))}
                                    {schedules.length === 0 && <p className="text-gray-500 italic">Sin horarios asignados.</p>}
                                </div>
                            </>
                        ) : <p className="text-gray-500">Selecciona un paralelo.</p>}
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
