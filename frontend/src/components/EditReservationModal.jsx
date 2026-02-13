import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { X, Save, Clock, Calendar } from 'lucide-react'

export default function EditReservationModal({ reservation, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        fecha: '',
        horaInicio: '',
        horaFin: '',
        motivo: ''
    })

    useEffect(() => {
        if (reservation) {
            setForm({
                fecha: reservation.fecha,
                horaInicio: reservation.horaInicio,
                horaFin: reservation.horaFin,
                motivo: reservation.motivo || ''
            })
        }
    }, [reservation])

    async function handleSubmit(e) {
        e.preventDefault()
        if (form.horaFin <= form.horaInicio) {
            return alert("La hora de fin debe ser posterior a la de inicio")
        }

        setLoading(true)
        try {
            const updated = await apiFetch(`/reservas/${reservation._id}`, {
                method: 'PUT',
                body: form
            })
            onUpdate(updated)
            onClose()
        } catch (e) {
            alert(e.message || 'Error al actualizar')
        } finally {
            setLoading(false)
        }
    }

    if (!reservation) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Editar Reserva</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Laboratorio</label>
                        <div className="font-medium text-gray-800">{reservation.laboratorio}</div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Fecha</label>
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="date"
                                className="w-full border pl-10 p-2 rounded bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                value={form.fecha}
                                onChange={e => setForm({ ...form, fecha: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Horario</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="time"
                                    className="w-full border pl-10 p-2 rounded bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={form.horaInicio}
                                    onChange={e => setForm({ ...form, horaInicio: e.target.value })}
                                    required
                                />
                            </div>
                            <span className="text-gray-400">-</span>
                            <div className="relative flex-1">
                                <Clock size={16} className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="time"
                                    className="w-full border pl-10 p-2 rounded bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                                    value={form.horaFin}
                                    onChange={e => setForm({ ...form, horaFin: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Motivo</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded bg-white focus:ring-2 focus:ring-blue-100 outline-none"
                            value={form.motivo}
                            onChange={e => setForm({ ...form, motivo: e.target.value })}
                            placeholder="Ej: Tesis, Práctica, Clase..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
