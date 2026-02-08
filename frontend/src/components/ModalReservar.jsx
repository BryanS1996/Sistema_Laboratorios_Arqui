import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

export default function ModalReservar({ lab, fecha, onClose, onSuccess }) {
    const [occupied, setOccupied] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [motivo, setMotivo] = useState('')

    useEffect(() => {
        async function checkAvailability() {
            try {
                const res = await apiFetch(`/laboratorios/${lab._id}/disponibilidad?fecha=${fecha}`)
                setOccupied(res.reservas || [])
            } catch (e) {
                console.error("Error checking availability", e)
            } finally {
                setLoading(false)
            }
        }
        if (lab) checkAvailability()
    }, [lab, fecha])

    async function handleConfirm() {
        if (!selectedSlot) return
        setSubmitting(true)
        try {
            await apiFetch('/reservas', {
                method: 'POST',
                body: {
                    laboratorio: lab.nombre, // Sending Name as currently required by Backend
                    fecha,
                    horaInicio: selectedSlot.startTime,
                    horaFin: selectedSlot.endTime,
                    motivo: motivo || 'Reserva desde el catálogo'
                }
            })
            onSuccess()
            onClose()
        } catch (e) {
            alert("Error al reservar: " + e.message)
        } finally {
            setSubmitting(false)
        }
    }

    // Predefined slots from Lab model, or fallback
    const allSlots = lab.slots && lab.slots.length > 0 ? lab.slots : [
        { startTime: '07:00', endTime: '09:00', label: '07:00 - 09:00' },
        { startTime: '09:00', endTime: '11:00', label: '09:00 - 11:00' },
        { startTime: '11:00', endTime: '13:00', label: '11:00 - 13:00' },
        { startTime: '14:00', endTime: '16:00', label: '14:00 - 16:00' },
        { startTime: '16:00', endTime: '18:00', label: '16:00 - 18:00' }
    ]

    const isOccupied = (slot) => {
        return occupied.some(occ => occ.horaInicio === slot.startTime)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="text-xl font-bold text-gray-900">Reservar Laboratorio</h3>
                <p className="text-sm text-gray-500">{lab.nombre} · {fecha}</p>

                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un horario</label>

                    {loading ? (
                        <div className="text-sm text-gray-400">Verificando disponibilidad...</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2">
                            {allSlots.map((slot) => {
                                const disabled = isOccupied(slot)
                                const isSelected = selectedSlot === slot
                                return (
                                    <button
                                        key={slot.label}
                                        onClick={() => !disabled && setSelectedSlot(slot)}
                                        disabled={disabled}
                                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                      ${disabled
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                                : isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-700 hover:border-blue-300'
                                            }
                    `}
                                    >
                                        {slot.label}
                                        {disabled && <span className="block text-[10px] text-red-400">Ocupado</span>}
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo (Opcional)</label>
                    <input
                        className="w-full rounded-lg border px-3 py-2 text-sm"
                        value={motivo}
                        onChange={e => setMotivo(e.target.value)}
                        placeholder="Clase, práctica, etc."
                    />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSlot || submitting}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {submitting ? 'Reservando...' : 'Confirmar Reserva'}
                    </button>
                </div>
            </div>
        </div>
    )
}
