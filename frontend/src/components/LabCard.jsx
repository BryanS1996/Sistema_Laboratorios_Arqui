export default function LabCard({ lab, onReservar }) {
    return (
        <div className="flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start gap-4">
                {/* Icon/Image Placeholder */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="flex-1">
                    <h3 className="text-base font-semibold text-slate-900">{lab.nombre}</h3>
                    {/* Tag for special labs? "Premium" in screenshot */}
                    {lab.capacidad > 30 && (
                        <span className="mt-1 inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                            <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                            Estándar
                        </span>
                    )}
                    {lab.equipamiento?.includes('Mac') && (
                        <span className="mt-1 ml-2 inline-flex items-center rounded bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Premium
                        </span>
                    )}
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                        Laboratorio equipado para prácticas y clases.
                        {/* Use description if available in model, otherwise generic placeholder */}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{lab.ubicacion}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Cap: {lab.capacidad}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Disponible
                </span>
                <button
                    onClick={() => onReservar(lab)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Reservar
                </button>
            </div>
        </div>
    )
}
