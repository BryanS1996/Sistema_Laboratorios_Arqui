import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout'
import { apiFetch } from '../lib/api'

function formatDate(fecha) {
  // If fecha is ISO string YYYY-MM-DD
  return fecha
}

export default function Reservas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const hasItems = useMemo(() => items?.length > 0, [items])

  async function load() {
    setError('')
    setLoading(true)
    try {
      const r = await apiFetch('/reservas/mine')
      setItems(r)
    } catch (e) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function cancelReserva(id) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return
    setError('')
    try {
      await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message || 'Error al cancelar')
    }
  }

  function handleReport(reserva) {
    // Navigate to reports page, optionally passing reserva details via state
    navigate('/reportes', { state: { reserva } })
  }

  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mis Reservas</h1>
          <p className="mt-1 text-sm text-gray-500">Consulta y gestiona tus reservas activas</p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200 flex items-center gap-2">
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
          {error}
        </div>
      )}

      <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b bg-gray-50 px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Historial de Reservas</h2>
          {loading && <span className="text-xs text-gray-500 animate-pulse">Cargando...</span>}
        </div>

        {!loading && !hasItems ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes reservas</h3>
            <p className="mt-1 text-sm text-gray-500">Ve al catálogo para realizar tu primera reserva.</p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/catalogo')}
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Ir al Catálogo
              </button>
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-gray-100">
          {items?.map((it) => (
            <div key={it._id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-blue-900">{it.laboratorio}</h3>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Confirmada
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatDate(it.fecha)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {it.horaInicio} - {it.horaFin}
                  </div>
                </div>
                {it.motivo && (
                  <p className="mt-2 text-sm text-gray-600 italic">"{it.motivo}"</p>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => handleReport(it)}
                  className="flex-1 sm:flex-none justify-center inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  Reportar
                </button>
                <button
                  onClick={() => cancelReserva(it._id)}
                  className="flex-1 sm:flex-none justify-center inline-flex items-center rounded-lg border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  Cancelar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
