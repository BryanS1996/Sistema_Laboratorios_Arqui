export default function Topbar({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {subtitle ? <p className="mt-1 text-sm text-gray-600">{subtitle}</p> : null}
    </div>
  )
}
