import { useState, useEffect } from 'react'
import AppLayout from '../components/AppLayout'
import LabCard from '../components/LabCard'
import { apiFetch } from '../lib/api'
import ModalReservar from '../components/ModalReservar'

export default function Catalogo() {
    const [labs, setLabs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('Todos')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10))
    const [selectedLabForBooking, setSelectedLabForBooking] = useState(null)

    useEffect(() => {
        async function loadLabs() {
            try {
                const data = await apiFetch('/laboratorios')
                setLabs(data)
            } catch (error) {
                console.error("Error cargando laboratorios:", error)
            } finally {
                setLoading(false)
            }
        }
        loadLabs()
    }, [])

    const filteredLabs = labs.filter(lab => {
        const matchesSearch = lab.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
        // Mock filter type logic - in real app, labs would have a 'type' field
        const matchesType = filterType === 'Todos' ||
            (filterType === 'Premium' && lab.equipamiento?.includes('Mac')) ||
            (filterType === 'Estándar' && !lab.equipamiento?.includes('Mac'));

        return matchesSearch && matchesType;
    })

    function handleReservar(lab) {
        setSelectedLabForBooking(lab)
    }

    function handleBookingSuccess() {
        // Optional: show toast, or refresh labs if needed (though availability is dynamic)
        alert("¡Reserva exitosa!")
    }

    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Catálogo de laboratorios</h1>
                <p className="mt-2 text-slate-600">Selecciona fecha y reserva un horario disponible.</p>
            </div>

            {/* Filters Bar */}
            <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row md:items-end">
                <div className="flex-1">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Buscar</label>
                    <input
                        type="text"
                        placeholder="Nombre, descripción o ubicación..."
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="w-full md:w-48">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Tipo</label>
                    <select
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option>Todos</option>
                        <option>Estándar</option>
                        <option>Premium</option>
                    </select>
                </div>

                <div className="w-full md:w-48">
                    <label className="mb-1 block text-xs font-semibold text-gray-500">Fecha</label>
                    <input
                        type="date"
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>

                <button
                    className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
                >
                    Hoy
                </button>
            </div>

            <div className="mb-4 text-sm text-gray-500">
                Mostrando <span className="font-semibold text-slate-900">{filteredLabs.length}</span> de {labs.length} laboratorios
            </div>

            {/* Grid */}
            {loading ? (
                <div className="py-20 text-center text-gray-500">Cargando catálogo...</div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredLabs.map(lab => (
                        <LabCard key={lab._id} lab={lab} onReservar={handleReservar} />
                    ))}
                </div>
            )}

            {selectedLabForBooking && (
                <ModalReservar
                    lab={selectedLabForBooking}
                    fecha={selectedDate}
                    onClose={() => setSelectedLabForBooking(null)}
                    onSuccess={handleBookingSuccess}
                />
            )}
        </AppLayout>
    )
}
