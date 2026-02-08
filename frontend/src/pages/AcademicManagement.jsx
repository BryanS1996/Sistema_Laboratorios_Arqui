import React, { useState, useEffect } from 'react';
import { getSubjects, createSubject, deleteSubject, getParallelsBySubject, createParallel, deleteParallel } from '../lib/academic';

export default function AcademicManagement() {
    const [subjects, setSubjects] = useState([]);
    const [newSubject, setNewSubject] = useState({ name: '', description: '' });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [parallels, setParallels] = useState([]);
    const [newParallel, setNewParallel] = useState({ name: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            loadParallels(selectedSubject.id);
        } else {
            setParallels([]);
        }
    }, [selectedSubject]);

    async function loadSubjects() {
        try {
            setLoading(true);
            const data = await getSubjects();
            setSubjects(data);
        } catch (err) {
            setError('Error al cargar asignaturas');
        } finally {
            setLoading(false);
        }
    }

    async function loadParallels(subjectId) {
        try {
            setLoading(true);
            const data = await getParallelsBySubject(subjectId);
            setParallels(data);
        } catch (err) {
            setError('Error al cargar paralelos');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddSubject(e) {
        e.preventDefault();
        if (!newSubject.name) return;
        try {
            await createSubject(newSubject);
            setNewSubject({ name: '', description: '' });
            loadSubjects();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDeleteSubject(id) {
        if (!window.confirm('¿Estás seguro? Se borrarán también los paralelos asociados.')) return;
        try {
            await deleteSubject(id);
            if (selectedSubject?.id === id) setSelectedSubject(null);
            loadSubjects();
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleAddParallel(e) {
        e.preventDefault();
        if (!newParallel.name || !selectedSubject) return;
        try {
            await createParallel({ ...newParallel, subjectId: selectedSubject.id });
            setNewParallel({ name: '' });
            loadParallels(selectedSubject.id);
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleDeleteParallel(id) {
        if (!window.confirm('¿Estás seguro?')) return;
        try {
            await deleteParallel(id);
            loadParallels(selectedSubject.id);
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Gestión Académica</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Subjects Panel */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">Asignaturas</h2>

                    <form onSubmit={handleAddSubject} className="mb-4 flex gap-2">
                        <input
                            type="text"
                            placeholder="Nombre Asignatura"
                            className="border p-2 rounded flex-1"
                            value={newSubject.name}
                            onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Desc."
                            className="border p-2 rounded w-24"
                            value={newSubject.description}
                            onChange={e => setNewSubject({ ...newSubject, description: e.target.value })}
                        />
                        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+</button>
                    </form>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {subjects.map(sub => (
                            <div
                                key={sub.id}
                                className={`p-3 border rounded flex justify-between items-center cursor-pointer ${selectedSubject?.id === sub.id ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`}
                                onClick={() => setSelectedSubject(sub)}
                            >
                                <div>
                                    <div className="font-medium">{sub.name}</div>
                                    <div className="text-xs text-gray-500">{sub.description}</div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id); }}
                                    className="text-red-500 hover:text-red-700 px-2"
                                >
                                    🗑️
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Parallels Panel */}
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-semibold mb-4">
                        Paralelos {selectedSubject ? `de ${selectedSubject.name}` : '(Selecciona una asignatura)'}
                    </h2>

                    {selectedSubject ? (
                        <>
                            <form onSubmit={handleAddParallel} className="mb-4 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Nombre Paralelo"
                                    className="border p-2 rounded flex-1"
                                    value={newParallel.name}
                                    onChange={e => setNewParallel({ ...newParallel, name: e.target.value })}
                                />
                                <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+</button>
                            </form>

                            <div className="space-y-2">
                                {parallels.map(par => (
                                    <div key={par.id} className="p-3 border rounded flex justify-between items-center">
                                        <span>{par.name}</span>
                                        <button
                                            onClick={() => handleDeleteParallel(par.id)}
                                            className="text-red-500 hover:text-red-700 px-2"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                                {parallels.length === 0 && <p className="text-gray-500 italic">No hay paralelos registrados.</p>}
                            </div>
                        </>
                    ) : (
                        <div className="bg-gray-50 p-8 text-center text-gray-500 rounded border border-dashed">
                            Selecciona una asignatura para gestionar sus paralelos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
