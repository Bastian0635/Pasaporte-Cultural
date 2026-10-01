/**
 * Constantes fundamentales del sistema Pasaporte Cultural.
 */

export const ROLES = Object.freeze({
  VISITANTE: 'visitante',
  EDITOR: 'editor'
});

export const CATEGORIAS = Object.freeze({
  MUSEO: 'museo',
  GALERIA: 'galería',
  CENTRO_CULTURAL: 'centro cultural'
});

export const CATEGORIAS_VALIDAS = Object.freeze(Object.values(CATEGORIAS));
export const ROLES_VALIDOS = Object.freeze(Object.values(ROLES));

export const ESTADOS = Object.freeze({
  ACTIVO: true,
  INACTIVO: false
});

export const APP_CONFIG = Object.freeze({
  TIMEZONE: 'America/Bogota',
  DATE_FORMAT: 'YYYY-MM-DD',
  SESSION_COOKIE_NAME: 'pasaporte_session',
  SESSION_DURATION_HOURS: 24,
  PORT: process.env.PORT || 3000
});
