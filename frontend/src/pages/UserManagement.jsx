import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { getSubjects } from '../lib/academic'

import AppLayout from '../components/AppLayout'

export default function UserManagement() {
    const [users, setUsers] = useState([])
    const [subjects, setSubjects] = useState([])
    const [semesters, setSemesters] = useState([]) // New state
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Unififed Edit State
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({
        role: '',
        semester: '',
        subjectIds: []
    })
    const [loadingDetails, setLoadingDetails] = useState(false)
    const [semesterParallels, setSemesterParallels] = useState([]) // New state

    // ...

    useEffect(() => {
        fetchUsers()
        loadSubjects()
        loadSemesters()
    }, [])

    // ...

    async function fetchUsers() {
        try {
            setLoading(true)
            const data = await apiFetch('/users')
            setUsers(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function loadSubjects() {
        try { setSubjects(await getSubjects()) } catch (e) { console.error(e) }
    }

    async function loadSemesters() {
        try {
            const data = await apiFetch('/academic/semesters')
            setSemesters(data)
        } catch (e) {
            console.error(e)
        }
    }

    async function handleSemesterChange(semesterId) {
        setEditForm(prev => ({ ...prev, semester: semesterId, parallel: '' }))
        if (!semesterId) {
            setSemesterParallels([])
            return
        }

        try {
            // Fetch available parallels for this semester
            const data = await apiFetch(`/academic/semesters/${semesterId}/parallels`)
            // data is array of { name: "SI7-001" } objects
            setSemesterParallels(data)
        } catch (e) {
            console.error(e)
            setSemesterParallels([])
        }
    }

    async function handleEditClick(user) {
        setEditingUser(user)
        setEditForm({
            role: user.role,
            semester: '', // Reset
            subjectIds: [] // Reset
        })

        // Try to pre-fill sensitive data
        if (user.role === 'student' && user.context) {
            // "Semestre 3 (P1)" -> 3
            const match = user.context.match(/Semestre (\d+)/)
            if (match) setEditForm(prev => ({ ...prev, semester: match[1] }))
        } else if (user.role === 'professor') {
            setLoadingDetails(true)
            try {
                // Fetch current assignments using the new Admin endpoint
                const assignedSubjects = await apiFetch(`/professors/${user.id}/subjects`)
                // assignedSubjects is array of { id, name, ... }
                setEditForm(prev => ({
                    ...prev,
                    subjectIds: assignedSubjects.map(s => s.id)
                }))
            } catch (e) {
                console.error('Error fetching subjects', e)
            } finally {
                setLoadingDetails(false)
            }
        }
    }

    async function handleSave() {
        if (!editingUser) return
        try {
            // 1. Update Role
            if (editForm.role !== editingUser.role) {
                await apiFetch(`/users/${editingUser.id}/role`, {
                    method: 'PUT',
                    body: { role: editForm.role }
                })
            }

            // 2. Update Context
            if (editForm.role === 'student' && editForm.semester) {
                await apiFetch(`/academic/students/${editingUser.id}/semester`, {
                    method: 'PUT',
                    body: { semester: editForm.semester, parallel: editForm.parallel }
                })
            } else if (editForm.role === 'professor') {
                await apiFetch(`/academic/professors/${editingUser.id}/subjects`, {
                    method: 'PUT',
                    body: { subjectIds: editForm.subjectIds }
                })
            }

            setEditingUser(null)
            fetchUsers()
        } catch (err) {
            alert('Error al guardar: ' + err.message)
        }
    }

    if (loading) return <AppLayout><div className="p-4">Cargando usuarios...</div></AppLayout>
    if (error) return <AppLayout><div className="p-4 text-red-500">Error: {error}</div></AppLayout>

    return (
        <AppLayout>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contexto Académico</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{user.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'professor' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.role === 'admin' ? 'Administrador' : user.role === 'professor' ? 'Profesor' : 'Estudiante'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {user.context || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditClick(user)}
                                                className="text-indigo-600 hover:text-indigo-900 font-bold"
                                            >
                                                Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-gray-200">
                        {users.map((user) => (
                            <div key={user.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">{user.nombre}</div>
                                        <div className="text-sm text-gray-500">{user.email}</div>
                                    </div>
                                    <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'professor' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'}`}>
                                        {user.role === 'admin' ? 'Admin' : user.role === 'professor' ? 'Prof' : 'Est'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <span className="font-semibold">Contexto:</span> {user.context || '-'}
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        onClick={() => handleEditClick(user)}
                                        className="text-indigo-600 text-sm font-medium border border-indigo-200 rounded px-3 py-1 bg-indigo-50"
                                    >
                                        Editar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Unified Edit Modal */}
                {editingUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                            <h3 className="text-lg font-bold mb-4">Editar Usuario</h3>

                            <div className="mb-4">
                                <p className="text-sm text-gray-500">Nombre: <span className="text-gray-900 font-medium">{editingUser.nombre}</span></p>
                                <p className="text-sm text-gray-500">Email: <span className="text-gray-900 font-medium">{editingUser.email}</span></p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={editForm.role}
                                        onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                    >
                                        <option value="student">Estudiante</option>
                                        <option value="professor">Profesor</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>

                                {editForm.role === 'student' && (
                                    <div className="p-4 bg-gray-50 rounded border space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Semestre</label>
                                            <select
                                                className="w-full border p-2 rounded"
                                                value={editForm.semester}
                                                onChange={e => handleSemesterChange(e.target.value)}
                                            >
                                                <option value="">Seleccionar Semestre...</option>
                                                {semesters.map(s => (
                                                    <option key={s.id} value={s.id}>{s.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Paralelo</label>
                                            <select
                                                className="w-full border p-2 rounded"
                                                value={editForm.parallel}
                                                onChange={e => setEditForm(prev => ({ ...prev, parallel: e.target.value }))}
                                                disabled={!editForm.semester}
                                            >
                                                <option value="">Seleccionar Paralelo...</option>
                                                {semesterParallels.map(p => (
                                                    <option key={p.name} value={p.name}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Asigna al estudiante a todos los paralelos '{editForm.parallel || '...'}' del semestre seleccionado.
                                        </p>
                                    </div>
                                )}

                                {editForm.role === 'professor' && (
                                    <div className="p-4 bg-gray-50 rounded border">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Asignaturas (Selección Múltiple)</label>
                                        <div className="max-h-48 overflow-y-auto border rounded bg-white p-2 space-y-1">
                                            {subjects.map(sub => (
                                                <label key={sub.id} className="flex items-center gap-2 text-sm p-1 hover:bg-utility-50 rounded cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={editForm.subjectIds.includes(sub.id)}
                                                        onChange={e => {
                                                            const checked = e.target.checked
                                                            setEditForm(prev => ({
                                                                ...prev,
                                                                subjectIds: checked
                                                                    ? [...prev.subjectIds, sub.id]
                                                                    : prev.subjectIds.filter(id => id !== sub.id)
                                                            }))
                                                        }}
                                                    />
                                                    {sub.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
