import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { getSubjects, getLaboratories } from '../../lib/academic'
import AppLayout from '../../components/AppLayout'

export default function CreateReservation() {
    const [searchParams] = useSearchParams()
    const preSelectedLabId = searchParams.get('labId')

    const [laboratories, setLaboratories] = useState([])
    const [subjects, setSubjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [form, setForm] = useState({
        laboratorio: '',
        fecha: new Date().toISOString().slice(0, 10),
        horaInicio: '10:00',
        horaFin: '12:00',
        motivo: 'Práctica',
        subjectId: ''
    })

    useEffect(() => {
        async function loadData() {
            try {
                const [subs, labs] = await Promise.all([
                    getSubjects(),
                    getLaboratories()
                ])
                setSubjects(subs)
                setLaboratories(labs)
                if (labs.length > 0) {
                    let defaultLabName = labs[0].nombre
                    if (preSelectedLabId) {
                        const found = labs.find(l => String(l.id) === String(preSelectedLabId))
                        if (found) defaultLabName = found.nombre
                    }
                    setForm(f => ({ ...f, laboratorio: defaultLabName }))
                }
            } catch (e) {
                setError(e.message || 'Error al cargar datos')
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setSuccess('')

        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const d = new Date(`${form.fecha}T00:00:00`)
        if (d < hoy) {
            setError('No se pueden crear reservas en fechas anteriores')
            return
        }

        if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
            setError('Rango de horas inválido')
            return
        }

        try {
            await apiFetch('/reservas', { method: 'POST', body: form })
            setSuccess('Reserva creada exitosamente')
            setForm({
                ...form,
                motivo: 'Práctica',
                // keep date/lab/subject usually
            })
        } catch (e) {
            setError(e.message || 'Error al crear reserva')
        }
    }

    return (
        <AppLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Hacer Reserva</h1>
                <p className="mt-1 text-sm text-gray-500">Completa el formulario para reservar un laboratorio.</p>
            </div>

            <div className="rounded-xl border bg-white p-6 shadow-sm max-w-2xl">
                {error && (
                    <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 border-l-4 border-red-500">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-700 border-l-4 border-green-500">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Cargando formulario...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Laboratorio</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={form.laboratorio}
                                onChange={(e) => setForm({ ...form, laboratorio: e.target.value })}
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                {laboratories.map(lab => (
                                    <option key={lab.id} value={lab.nombre}>{lab.nombre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Fecha</label>
                            <input
                                type="date"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={form.fecha}
                                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                                min={new Date().toISOString().slice(0, 10)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                                <input
                                    type="time"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={form.horaInicio}
                                    onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                                <input
                                    type="time"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    value={form.horaFin}
                                    onChange={(e) => setForm({ ...form, horaFin: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Asignatura</label>
                            <select
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={form.subjectId}
                                onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                                required
                            >
                                <option value="">-- Seleccionar --</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Motivo</label>
                            <input
                                type="text"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                value={form.motivo}
                                onChange={(e) => setForm({ ...form, motivo: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Confirmar Reserva
                        </button>
                    </form>
                )}
            </div>
        </AppLayout>
    )
}
