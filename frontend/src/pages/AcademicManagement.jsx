import { useState, useEffect } from 'react'
import {
    getSubjects, createSubject, deleteSubject,
    getParallelsBySubject, createParallel, deleteParallel,
    getLaboratories, createLaboratory, updateLaboratory, deleteLaboratory,
    getSchedules, createSchedule, generateReservations
} from '../lib/academic'
import { Trash2, Edit2, Plus, Calendar, Clock, MapPin, School, BookOpen } from 'lucide-react'

import AppLayout from '../components/AppLayout'

export default function AcademicManagement() {
    const [activeTab, setActiveTab] = useState('labs') // 'labs' | 'academic'

    return (
        <AppLayout>
            <div className="container mx-auto max-w-6xl p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión Académica</h1>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('labs')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'labs' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Laboratorios
                        </button>
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'academic' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Carga Académica y Horarios
                        </button>
                    </div>
                </div>

                {activeTab === 'labs' ? <LabsPanel /> : <AcademicPanel />}
            </div>
        </AppLayout>
    )
}

function LabsPanel() {
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLab, setEditingLab] = useState(null) // null = create mode
    const [form, setForm] = useState({ nombre: '', capacidad: '', ubicacion: '' })

    useEffect(() => { loadLabs() }, [])

    async function loadLabs() {
        setLoading(true)
        try { setLabs(await getLaboratories()) }
        catch (e) { alert(e.message) }
        finally { setLoading(false) }
    }

    function openModal(lab = null) {
        setEditingLab(lab)
        setForm(lab ? { ...lab } : { nombre: '', capacidad: '', ubicacion: '' })
        setIsModalOpen(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            if (editingLab) await updateLaboratory(editingLab.id, form)
            else await createLaboratory(form)
            setIsModalOpen(false)
            loadLabs()
        } catch (e) { alert(e.message) }
    }

    async function handleDelete(id) {
        if (!confirm('¿Estás seguro de eliminar este laboratorio?')) return
        try { await deleteLaboratory(id); loadLabs() }
        catch (e) { alert(e.message) }
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <Plus size={18} /> Nuevo Laboratorio
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {labs.map(lab => (
                    <div key={lab.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                <School size={20} />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => openModal(lab)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(lab.id)} className="p-1 text-gray-400 hover:text-red-500 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{lab.nombre}</h3>
                        <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <MapPin size={14} /> {lab.ubicacion}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-700">{lab.capacidad}</span> estudiantes
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">{editingLab ? 'Editar Laboratorio' : 'Nuevo Laboratorio'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input className="w-full border p-2 rounded" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Capacidad</label>
                                <input type="number" className="w-full border p-2 rounded" value={form.capacidad} onChange={e => setForm({ ...form, capacidad: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Ubicación</label>
                                <input className="w-full border p-2 rounded" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} required />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function AcademicPanel() {
    // Shared State for Form
    const [labs, setLabs] = useState([])
    const [subjects, setSubjects] = useState([])
    const [parallels, setParallels] = useState([])

    // Form State
    const [form, setForm] = useState({
        labId: '',
        dia: 'Lunes', horaInicio: '07:00', horaFin: '09:00',
        subjectId: '', parallelId: '',
        startDate: '', endDate: '' // Period for generation
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => { loadInitialData() }, [])
    useEffect(() => {
        if (form.subjectId) loadParallels(form.subjectId)
        else setParallels([])
    }, [form.subjectId])

    async function loadInitialData() {
        try {
            const [l, s] = await Promise.all([getLaboratories(), getSubjects()])
            setLabs(l)
            setSubjects(s)

            // Set default dates (approx semester)
            const today = new Date().toISOString().split('T')[0]
            const fourMonthsLater = new Date()
            fourMonthsLater.setMonth(fourMonthsLater.getMonth() + 4)
            const endDate = fourMonthsLater.toISOString().split('T')[0]

            setForm(f => ({ ...f, startDate: today, endDate }))
        } catch (e) {
            console.error(e)
        }
    }

    async function loadParallels(subjectId) {
        try {
            setParallels(await getParallelsBySubject(subjectId))
        } catch (e) {
            console.error(e)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.labId || !form.subjectId || !form.parallelId || !form.startDate || !form.endDate) {
            return alert("Por favor completa todos los campos del formulario")
        }

        if (!confirm("¿Confirmar asignación y generar reservas para el periodo seleccionado?")) return

        if (form.horaFin <= form.horaInicio) {
            return alert("La hora de fin debe ser posterior a la de inicio")
        }

        setLoading(true)
        try {
            // 1. Create Schedule Pattern
            const schedule = await createSchedule({
                labId: form.labId,
                dia: form.dia,
                horaInicio: form.horaInicio,
                horaFin: form.horaFin,
                parallelId: form.parallelId
            })

            // 2. Generate Reservations for this Schedule
            await generateReservations(form.startDate, form.endDate, schedule.id)

            alert("Asignación completada y reservas generadas exitosamente.")
            // Reset form partially or refresh view
        } catch (e) {
            alert(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                        <BookOpen className="text-blue-600" /> Nueva Asignación
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                        {/* 1. Lab */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">1. Laboratorio</label>
                            <select
                                className="w-full border p-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
                                value={form.labId}
                                onChange={e => setForm({ ...form, labId: e.target.value })}
                                required
                            >
                                <option value="">Seleccionar Laboratorio...</option>
                                {labs.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                            </select>
                        </div>

                        {/* 2. Schedule */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">2. Horario</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <select
                                    className="flex-1 border p-2 rounded bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={form.dia}
                                    onChange={e => setForm({ ...form, dia: e.target.value })}
                                >
                                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <div className="flex items-center gap-1 flex-1">
                                    <input type="time" className="w-full border p-2 rounded bg-gray-50" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} />
                                    <span className="text-gray-400">-</span>
                                    <input type="time" className="w-full border p-2 rounded bg-gray-50" value={form.horaFin} onChange={e => setForm({ ...form, horaFin: e.target.value })} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Subject & Parallel */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">3. Asignatura y Paralelo</label>
                            <select
                                className="w-full border p-2 rounded bg-gray-50"
                                value={form.subjectId}
                                onChange={e => setForm({ ...form, subjectId: e.target.value })}
                                required
                            >
                                <option value="">Asignatura...</option>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select
                                className="w-full border p-2 rounded bg-gray-50"
                                value={form.parallelId}
                                onChange={e => setForm({ ...form, parallelId: e.target.value })}
                                disabled={!form.subjectId}
                                required
                            >
                                <option value="">Paralelo...</option>
                                {parallels.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>

                        {/* 4. Dates */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">4. Vigencia del Semestre</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1">
                                    <span className="text-[10px] text-gray-400 block mb-0.5">Inicio</span>
                                    <input type="date" className="w-full border p-2 rounded bg-gray-50" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-gray-400 block mb-0.5">Fin</span>
                                    <input type="date" className="w-full border p-2 rounded bg-gray-50" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : <Calendar size={18} />}
                            {loading ? 'Procesando...' : 'Guardar y Generar Reservas'}
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2">
                {form.labId ? (
                    <LabStatusView labId={form.labId} labs={labs} key={form.labId} />
                ) : (
                    <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-400 border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center">
                        <School size={48} className="mb-4 opacity-20" />
                        <p className="text-lg font-medium">Selecciona un laboratorio en el formulario</p>
                        <p className="text-sm">Podrás ver los horarios ya registrados para ese espacio.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function LabStatusView({ labId, labs }) {
    const [schedules, setSchedules] = useState([])
    const lab = labs.find(l => l.id == labId)

    useEffect(() => { load() }, [labId])
    async function load() {
        try {
            setSchedules(await getSchedules(null, labId))
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Clock className="text-blue-600" /> Horarios: <span className="text-blue-900">{lab?.nombre}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'].map(day => {
                    const daySchs = schedules.filter(s => s.dia === day).sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
                    return (
                        <div key={day} className="border rounded-lg p-3 bg-gray-50/50">
                            <h4 className="font-bold text-gray-500 text-xs uppercase mb-2 border-b pb-1">{day}</h4>
                            <div className="space-y-2">
                                {daySchs.map(sch => (
                                    <div key={sch.id} className="bg-white p-2 rounded shadow-sm border-l-4 border-blue-500 text-sm">
                                        <div className="font-bold text-gray-800">{sch.subject_name} ({sch.parallel_name})</div>
                                        <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-1">
                                            <Clock size={12} /> {sch.hora_inicio.slice(0, 5)} - {sch.hora_fin.slice(0, 5)}
                                        </div>
                                    </div>
                                ))}
                                {daySchs.length === 0 && <span className="text-xs text-gray-300 italic">Sin clases programadas</span>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
