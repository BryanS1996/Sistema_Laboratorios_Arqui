import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'
import AppLayout from '../../components/AppLayout'
import { useAuth } from '../../contexts/AuthContext'

export default function AllReservations() {
    const [reservas, setReservas] = useState([])
    const [laboratories, setLaboratories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { isAdmin } = useAuth()

    // Load labs and reservations
    async function loadData() {
        setLoading(true)
        try {
            const [resData, labData] = await Promise.all([
                apiFetch('/reservas/mine'), // For admins this returns all
                apiFetch('/academic/laboratories')
            ])
            setReservas(resData)
            setLaboratories(labData)
        } catch (e) {
            setError(e.message || 'Error al cargar datos')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    // Helper to get reservations for a specific lab
    const getLabReservations = (labName) => {
        return reservas
            .filter(r => r.laboratorio === labName)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
    }

    return (
        <AppLayout>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Disponibilidad de Laboratorios</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Vista general de la ocupación por laboratorio.
                    </p>
                </div>
                <button onClick={loadData} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Recargar</button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {loading ? (
                <div className="text-gray-500">Cargando disponibilidad...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {laboratories.map(lab => {
                        const labRes = getLabReservations(lab.nombre)
                        // Only show upcoming?
                        const today = new Date().toISOString().slice(0, 10)
                        const upcoming = labRes.filter(r => r.fecha >= today)

                        return (
                            <div key={lab.id} className="flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden">
                                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                                    <h3 className="font-bold text-gray-900">{lab.nombre}</h3>
                                    <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border">Loc: {lab.ubicacion}</span>
                                </div>

                                <div className="p-4 flex-1 space-y-3">
                                    {upcoming.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm">
                                            Disfruta, todo libre :)
                                        </div>
                                    ) : (
                                        upcoming.map(r => (
                                            <div key={r._id} className="relative pl-3 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-indigo-500 before:rounded-full">
                                                <div className="text-xs font-semibold text-gray-900">
                                                    {r.fecha} <span className="text-gray-500">({r.horaInicio} - {r.horaFin})</span>
                                                </div>
                                                <div className="text-xs text-gray-600 truncate">{r.motivo || 'Reservado'}</div>
                                                {isAdmin && r.usuario && (
                                                    <div className="text-[10px] text-indigo-700 mt-0.5 truncate">
                                                        {r.usuario.nombre} ({r.usuario.role})
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-3 bg-gray-50 border-t text-center">
                                    <a href={`/reservas/new?labId=${lab.id}&labName=${encodeURIComponent(lab.nombre)}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-900 block w-full">
                                        + Agendar Aquí
                                    </a>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </AppLayout>
    )
}
