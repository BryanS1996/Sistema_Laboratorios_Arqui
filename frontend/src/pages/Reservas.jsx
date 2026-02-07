import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../components/AppLayout'
import { apiFetch } from '../lib/api'

function formatDate(fecha) {
  return fecha
}

export default function Reservas() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    laboratorio: 'Lab 1',
    fecha: new Date().toISOString().slice(0, 10),
    horaInicio: '10:00',
    horaFin: '12:00',
    motivo: 'Práctica'
  })

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

  useEffect(() => { load() }, [])

  async function createReserva(e) {
    e.preventDefault()
    setError('')

    // Validación en frontend para mejor UX (el backend también valida)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const d = new Date(`${form.fecha}T00:00:00`)
    if (d < hoy) {
      setError('No se pueden crear reservas en fechas anteriores')
      return
    }

    if (form.horaInicio && form.horaFin && form.horaFin <= form.horaInicio) {
      setError('Rango de horas inválido (la hora fin debe ser mayor a la hora inicio)')
      return
    }
    try {
      await apiFetch('/reservas', { method: 'POST', body: form })
      await load()
    } catch (e) {
      setError(e.message || 'Error')
    }
  }

  async function deleteReserva(id) {
    if (!confirm('¿Eliminar esta reserva?')) return
    setError('')
    try {
      await apiFetch(`/reservas/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message || 'Error')
    }
  }

  return (
    <AppLayout>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Mis Reservas</h1>
          <p className="mt-1 text-sm text-gray-500">Crea y consulta tus reservas</p>
        </div>
        <button onClick={load} className="rounded-lg border bg-white px-3 py-2 text-sm hover:bg-gray-50">
          Recargar
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Nueva reserva</h2>
          <form className="mt-4 space-y-4" onSubmit={createReserva}>
            <div>
              <label className="text-sm font-medium text-gray-700">Laboratorio</label>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.laboratorio}
                onChange={(e) => setForm((f) => ({ ...f, laboratorio: e.target.value }))}
              >
                <option>Lab 1</option>
                <option>Lab 2</option>
                <option>Lab 3</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                min={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Inicio</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  type="time"
                  value={form.horaInicio}
                  onChange={(e) => setForm((f) => ({ ...f, horaInicio: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fin</label>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                  type="time"
                  value={form.horaFin}
                  onChange={(e) => setForm((f) => ({ ...f, horaFin: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Motivo</label>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              />
            </div>

            <button className="w-full rounded-lg bg-gray-900 px-4 py-2 text-white font-medium hover:bg-gray-800">
              Guardar reserva
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Listado</h2>
            {loading ? <span className="text-sm text-gray-500">Cargando...</span> : null}
          </div>

          {!loading && !hasItems ? (
            <div className="mt-4 rounded-lg border bg-gray-50 p-4 text-sm text-gray-600">
              No tienes reservas todavía.
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {items?.map((it) => (
              <div key={it._id} className="rounded-xl border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{it.laboratorio}</div>
                    <div className="mt-1 text-sm text-gray-600">
                      {formatDate(it.fecha)} · {it.horaInicio} - {it.horaFin}
                    </div>
                    {it.motivo ? <div className="mt-1 text-xs text-gray-500">{it.motivo}</div> : null}
                  </div>
                  <button
                    onClick={() => deleteReserva(it._id)}
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
