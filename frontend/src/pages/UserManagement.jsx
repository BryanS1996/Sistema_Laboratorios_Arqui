import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

import AppLayout from '../components/AppLayout'

export default function UserManagement() {
    // ... existing state ...
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [editingId, setEditingId] = useState(null)
    const [newRole, setNewRole] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

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

    async function handleUpdateRole(id) {
        try {
            await apiFetch(`/users/${id}/role`, {
                method: 'PUT',
                body: { role: newRole }
            })
            setEditingId(null)
            fetchUsers() // Refresh list
        } catch (err) {
            alert('Error al actualizar rol')
        }
    }

    if (loading) return <AppLayout><div className="p-4">Cargando usuarios...</div></AppLayout>
    if (error) return <AppLayout><div className="p-4 text-red-500">Error: {error}</div></AppLayout>

    return (
        <AppLayout>
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>
                {/* ... Rest of content ... */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
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
                                        {editingId === user.id ? (
                                            <select
                                                value={newRole}
                                                onChange={(e) => setNewRole(e.target.value)}
                                                className="text-sm border rounded p-1"
                                            >
                                                <option value="student">Estudiante</option>
                                                <option value="professor">Profesor</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                    user.role === 'professor' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-green-100 text-green-800'}`}>
                                                {user.role === 'admin' ? 'Administrador' : user.role === 'professor' ? 'Profesor' : 'Estudiante'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.context || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === user.id ? (
                                            <div className="space-x-2">
                                                <button onClick={() => handleUpdateRole(user.id)} className="text-indigo-600 hover:text-indigo-900">Guardar</button>
                                                <button onClick={() => setEditingId(null)} className="text-gray-600 hover:text-gray-900">Cancelar</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setEditingId(user.id)
                                                    setNewRole(user.role)
                                                }}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                Editar Rol
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}

