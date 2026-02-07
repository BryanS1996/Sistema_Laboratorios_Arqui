export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null
  const styles = {
    info: 'border-gray-200 bg-white text-gray-900',
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-green-200 bg-green-50 text-green-800'
  }

  return (
    <div className={`mb-4 flex items-start justify-between gap-3 rounded-2xl border p-3 ${styles[type]}`}>
      <div className="text-sm">{message}</div>
      <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">✕</button>
    </div>
  )
}
