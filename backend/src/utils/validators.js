/**
 * Utilidades de validación reutilizables.
 *
 * Centraliza validaciones (email, fechas, horas, etc.) para evitar
 * repetir lógica en controladores/servicios.
 */

/** Normaliza un email para comparaciones/almacenamiento. */
function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

/**
 * Valida el formato de email.
 * Nota: no existe una validación perfecta, pero esta cubre la mayoría de casos.
 */
function isValidEmail(email) {
  const e = normalizeEmail(email);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(e);
}

/**
 * Parsea una fecha en formato YYYY-MM-DD y la devuelve a medianoche local.
 * Retorna null si el formato es inválido.
 */
function parseDateOnly(yyyyMmDd) {
  if (typeof yyyyMmDd !== "string") return null;
  const m = /^\d{4}-\d{2}-\d{2}$/.exec(yyyyMmDd.trim());
  if (!m) return null;
  const d = new Date(`${yyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * Retorna true si la fecha (YYYY-MM-DD) es anterior a hoy (medianoche).
 */
function isPastDate(yyyyMmDd) {
  const d = parseDateOnly(yyyyMmDd);
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

/** Valida un string de hora HH:MM (24h). */
function isValidTime(hhmm) {
  if (typeof hhmm !== "string") return false;
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hhmm.trim());
}

/** Convierte HH:MM a minutos desde 00:00. */
function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map((n) => Number(n));
  return h * 60 + m;
}

/**
 * Retorna true si horaFin es estrictamente posterior a horaInicio.
 */
function isValidTimeRange(horaInicio, horaFin) {
  if (!isValidTime(horaInicio) || !isValidTime(horaFin)) return false;
  return timeToMinutes(horaFin) > timeToMinutes(horaInicio);
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  parseDateOnly,
  isPastDate,
  isValidTime,
  isValidTimeRange,
};
