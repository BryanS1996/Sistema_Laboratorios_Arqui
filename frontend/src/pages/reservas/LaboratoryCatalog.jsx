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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {labs.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-500">
                            No hay laboratorios disponibles en este momento.
                        </div>
                    )}
                    {labs.map(lab => (
                        <div key={lab.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            {/* Decorative Background Blob */}
                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50 transition-transform duration-500 group-hover:scale-125"></div>

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex flex-col">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-800 transition-colors">{lab.nombre}</h3>
                                        <div className="h-1 w-10 bg-gradient-to-r from-blue-600 to-red-500 rounded-full mt-2 group-hover:w-16 transition-all duration-300"></div>
                                    </div>
                                    <span className={`shrink-0 flex h-8 min-w-[2rem] px-2 items-center justify-center rounded-lg text-xs font-bold shadow-sm border ${lab.capacidad > 0 ? 'bg-white text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                        {lab.capacidad} <span className="text-[9px] ml-0.5 text-gray-400 font-normal">MAX</span>
                                    </span>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ubicación</p>
                                            <p className="text-sm font-medium text-gray-700 truncate max-w-[140px]" title={lab.ubicacion}>{lab.ubicacion || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Horario</p>
                                            <p className="text-sm font-medium text-gray-700">07:00 - 19:00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => handleReserve(lab)}
                                className="relative z-10 w-full rounded-xl bg-gray-50 py-3 text-sm font-bold text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                            >
                                Reservar
                                <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </AppLayout>
    )
}
