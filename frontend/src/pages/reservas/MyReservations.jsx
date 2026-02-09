import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import AppLayout from '../../components/AppLayout'
import { useAuth } from '../../contexts/AuthContext'
import { Edit2 } from 'lucide-react'
import EditReservationModal from '../../components/EditReservationModal'

export default function MyReservations() {
    const [reservas, setReservas] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [editingReservation, setEditingReservation] = useState(null)
    const { user, isAdmin } = useAuth()

    async function loadReservas() {
        setLoading(true)
        try {
            const data = await apiFetch('/reservas/mine')

            let myData = data
            // Client-side filtering for Admin because backend returns ALL
            if (isAdmin && user?.id) {
                myData = data.filter(r => String(r.userId) === String(user.id))
            }

            setReservas(myData)
        } catch (e) {
            setError(e.message || 'Error al cargar reservas')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) loadReservas()
    }, [user])

    async function deleteReserva(id) {
        if (!confirm('¿Seguro que deseas eliminar tu reserva?')) return
        try {
            await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
            loadReservas()
        } catch (e) {
            alert(e.message || 'Error al eliminar')
        }
    }

    return (
        <AppLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Reservas</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Historial de reservas realizadas por ti.
                    </p>
                </div>
                <button onClick={loadReservas} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Recargar</button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
                <div className="text-gray-500">Cargando...</div>
            ) : (
                <div className="space-y-4">
                    {reservas.length === 0 && <div className="text-gray-500">No has realizado ninguna reserva.</div>}
                    {reservas.map(reserva => (
                        <div key={reserva._id} className="bg-white rounded-lg shadow-sm border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900">{reserva.laboratorio}</h3>
                                <div className="text-sm text-gray-600 mt-1 space-y-1">
                                    <div>
                                        <span className="font-medium text-gray-800">{reserva.fecha}</span> • {reserva.horaInicio} - {reserva.horaFin}
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-gray-500">
                                        <span><strong className="text-gray-700">Materia:</strong> {reserva.materia || 'No especificada'}</span>
                                        <span><strong className="text-gray-700">Profesor:</strong> {reserva.profesor || 'No asignado'}</span>
                                    </div>
                                </div>
                                {reserva.motivo && <p className="text-sm text-gray-500 italic mt-2">"{reserva.motivo}"</p>}
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setEditingReservation(reserva)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors"
                                >
                                    <Edit2 size={14} /> Editar
                                </button>
                                <button
                                    onClick={() => deleteReserva(reserva._id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {editingReservation && (
                <EditReservationModal
                    reservation={editingReservation}
                    onClose={() => setEditingReservation(null)}
                    onUpdate={() => { loadReservas(); setEditingReservation(null) }}
                />
            )}
        </AppLayout>
    )
}
