import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../lib/api'
import AppLayout from '../../components/AppLayout'
import { useAuth } from '../../contexts/AuthContext'
import gsap from 'gsap'
import { Link } from 'react-router-dom'
import { Trash2, Edit } from 'lucide-react'
import EditReservationModal from '../../components/EditReservationModal'

export default function AllReservations() {
    const [reservas, setReservas] = useState([])
    const [laboratories, setLaboratories] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { isAdmin, user } = useAuth()

    // State for modal
    const [editingReservation, setEditingReservation] = useState(null)

    // Refs for animation
    const cardsRef = useRef([])

    // Load labs and reservations
    async function loadData() {
        setLoading(true)
        try {
            const [resData, labData] = await Promise.all([
                apiFetch('/reservas'), // Fetch public availability (sanitized)
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

    async function handleDelete(id) {
        if (!confirm('¿Estás seguro de que deseas eliminar esta reserva? Esta acción no se puede deshacer.')) return
        try {
            await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
            // Optimistic update or reload
            setReservas(prev => prev.filter(r => r._id !== id))
            alert('Reserva eliminada correctamente')
        } catch (e) {
            alert(e.message || 'Error al eliminar')
        }
    }

    // Initial load
    useEffect(() => {
        loadData()

        // Polling every 10 seconds
        const interval = setInterval(() => {
            // Silently reload (don't set global loading state to avoid flicker)
            Promise.all([
                apiFetch('/reservas'),
                apiFetch('/academic/laboratories')
            ]).then(([resData, labData]) => {
                setReservas(resData)
                setLaboratories(labData)
            }).catch(e => console.error("Polling error", e))
        }, 10000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!loading && laboratories.length > 0) {
            // Animate cards entrance
            gsap.fromTo(".lab-card",
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            )
        }
    }, [loading, laboratories])

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
                    {laboratories.map((lab, index) => {
                        const labRes = getLabReservations(lab.nombre)
                        const today = new Date().toISOString().slice(0, 10)
                        const upcoming = labRes.filter(r => r.fecha >= today)

                        return (
                            <div key={lab.id} className="lab-card flex flex-col rounded-xl border bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                                        upcoming.map(r => {
                                            const isMine = user && String(r.userId) === String(user.id);
                                            // Check if reservation belongs to a subject assigned to this professor OR enrolled by this student
                                            const isMySubject = user && user.academicLoad && r.subjectId && (
                                                (user.role === 'professor' && user.academicLoad.some(s => String(s.id) === String(r.subjectId))) ||
                                                (user.role === 'student' && user.academicLoad.some(s => String(s.subjectId) === String(r.subjectId)))
                                            );

                                            // Solo Admin puede editar/borrar desde esta vista global
                                            const canEdit = isAdmin;

                                            return (
                                                <div
                                                    key={r._id}
                                                    className={`relative pl-3 rounded p-3 mb-2 transition-all duration-300 group
                                                        ${isMine
                                                            ? 'my-reservation bg-emerald-50 border-l-4 border-emerald-500 shadow-sm transform scale-[1.01]'
                                                            : isMySubject
                                                                ? 'my-subject-reservation bg-indigo-50 border-l-4 border-indigo-500 shadow-sm'
                                                                : 'pl-3 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:bg-gray-300 before:rounded-full'
                                                        }`}
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <div className="text-xs font-semibold text-gray-900 flex justify-between gap-2">
                                                                <span>{r.fecha}</span>
                                                                <span className="text-gray-500">{r.horaInicio} - {r.horaFin}</span>
                                                            </div>

                                                            {/* Materia */}
                                                            {r.materia !== 'No especificada' && (
                                                                <div className={`text-xs font-bold truncate mt-1 ${isMySubject ? 'text-indigo-700' : 'text-gray-800'}`}>
                                                                    {r.materia}
                                                                </div>
                                                            )}

                                                            {/* Motivo / Actividad */}
                                                            <div className={`text-xs truncate mt-0.5 ${isMine ? 'text-emerald-700 font-bold text-sm' : isMySubject ? 'text-indigo-600 font-medium' : 'text-gray-500'}`}>
                                                                {r.motivo || 'Reservado'}
                                                            </div>

                                                            {/* Profesor */}
                                                            {r.profesor && r.profesor !== 'No asignado' && (
                                                                <div className="text-[10px] text-gray-500 truncate mt-1">
                                                                    Prof: {r.profesor}
                                                                </div>
                                                            )}

                                                            {/* Admin Info */}
                                                            {isAdmin && r.usuario && (
                                                                <div className="text-[10px] text-indigo-700 mt-1 pt-1 border-t border-indigo-100">
                                                                    By: {r.usuario.nombre} ({r.usuario.role})
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        {canEdit && (
                                                            <div className="flex flex-col gap-1 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                                <button
                                                                    onClick={() => setEditingReservation(r)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                                    title="Editar"
                                                                >
                                                                    <Edit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(r._id)}
                                                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}

                                                        {/* Professor Claim Action */}
                                                        {(() => {
                                                            const isProfessor = user && user.role === 'professor';
                                                            const isStudentRes = r.ownerRole === 'student';
                                                            const created = r.createdAt ? new Date(r.createdAt) : null;
                                                            const diff = created ? (new Date() - created) / 60000 : 999;

                                                            if (isProfessor && isStudentRes && diff < 10) {
                                                                return (
                                                                    <Link
                                                                        to={`/reservas/new?labId=${lab.id}&date=${r.fecha}&startTime=${r.horaInicio}&endTime=${r.horaFin}`}
                                                                        className="absolute right-2 bottom-2 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[10px] font-bold px-2 py-1 rounded border border-amber-200 shadow-sm transition-colors z-10"
                                                                        title="Reclamar este horario (Prioridad Profesor)"
                                                                    >
                                                                        ⚡ Reclamar ({Math.floor(10 - diff)}m)
                                                                    </Link>
                                                                )
                                                            }
                                                        })()}
                                                    </div>

                                                    {isMine && (
                                                        <div className="absolute top-1 right-1 pointer-events-none">
                                                            <span className="flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })
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

            {editingReservation && (
                <EditReservationModal
                    reservation={editingReservation}
                    onClose={() => setEditingReservation(null)}
                    onUpdate={() => {
                        loadData()
                        // Optional: Show success toast
                    }}
                />
            )}
        </AppLayout>
    )
}
