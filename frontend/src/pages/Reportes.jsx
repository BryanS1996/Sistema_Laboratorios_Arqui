import AppLayout from '../components/AppLayout'

export default function Reportes() {
    return (
        <AppLayout>
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-semibold">Mis Reportes</h1>
                    <p className="mt-1 text-sm text-gray-500">Historial de incidencias reportadas</p>
                </div>
                <button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                    Nuevo Reporte
                </button>
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-10 text-center text-gray-500">
                <p>Funcionalidad de reportes en construcción...</p>
            </div>
        </AppLayout>
    )
}
