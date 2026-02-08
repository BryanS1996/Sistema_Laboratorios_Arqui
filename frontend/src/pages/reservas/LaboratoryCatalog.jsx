import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import AppLayout from '../../components/AppLayout'

// Función auxiliar para obtener una imagen aleatoria (para demo) o un icono
function getRandomImage(id) {
    // Podríamos usar un servicio de placeholder o imágenes estáticas
    return `https://source.unsplash.com/random/400x300/?laboratory,technology&sig=${id}`
}

export default function LaboratoryCatalog() {
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        apiFetch('/academic/laboratories')
            .then(setLabs)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [])

    const handleReserve = (lab) => {
        // Navegar al formulario de creación con el lab pre-seleccionado
        navigate(`/reservas/new?labId=${lab.id}&labName=${encodeURIComponent(lab.nombre)}`)
    }

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Catálogo de Laboratorios</h1>
                <p className="mt-2 text-gray-600">Explora nuestros laboratorios y revisa su disponibilidad.</p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                    Error al cargar laboratorios: {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {labs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No hay laboratorios disponibles en este momento.
                        </div>
                    )}
                    {labs.map(lab => (
                        <div key={lab.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-md border border-gray-100">
                            {/* Image Placeholder */}
                            <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-100 to-gray-200">
                                    <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <h3 className="text-xl font-bold text-white tracking-wide">{lab.nombre}</h3>
                                </div>
                            </div>

                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                                        Capacidad: {lab.capacidad} est.
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                        Activo
                                    </span>
                                </div>

                                <div className="mb-6 space-y-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>{lab.ubicacion || 'Ubicación no especificada'}</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Horario: Lunes a Viernes, 7:00 - 19:00</span>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <button
                                        onClick={() => handleReserve(lab)}
                                        className="w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
                                    >
                                        Reservar Ahora
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    )
}
