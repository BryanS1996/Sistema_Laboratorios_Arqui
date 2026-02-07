import { apiFetch, setToken, clearToken } from './api'

export async function login(email, password) {
  const r = await apiFetch('/auth/login', { method: 'POST', body: { email, password }, auth: false })
  setToken(r.token)
  localStorage.setItem('user', JSON.stringify(r.user))
  return r
}

export async function register(nombre, email, password) {
  return apiFetch('/auth/register', { method: 'POST', body: { nombre, email, password }, auth: false })
}

export function getUser() {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
}

export function logout() {
  clearToken()
  localStorage.removeItem('user')
}
