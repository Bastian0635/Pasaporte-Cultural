/**
 * Utilidades de manejo de fechas y cálculo de períodos.
 * 
 * CRITERIO DE DÍA Y ZONA HORARIA (Regla 3 de Negocio):
 * - Se adopta la zona horaria estándar de Colombia/Latinoamérica: "America/Bogota" (UTC-5).
 * - La unidad de granularidad de un día corresponde a la fecha civil expresada en formato "YYYY-MM-DD".
 * - Toda comparación de "mismo día" para visitas o retos normaliza el instante a dicha fecha civil.
 * - Los períodos de retos incluyen tanto el día inicial como el día final inclusive (desde las 00:00:00 del día inicial
 *   hasta las 23:59:59 del día final).
 */

import { APP_CONFIG } from './constants.js';

/**
 * Normaliza y formatea una fecha a cadena YYYY-MM-DD según la zona horaria configurada.
 * @param {Date|string|number} [fecha=new Date()]
 * @returns {string} Cadena en formato YYYY-MM-DD
 */
export function obtenerFechaString(fecha = new Date()) {
  if (typeof fecha === 'string') {
    const trimmed = fecha.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
  }

  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) {
    throw new TypeError(`Fecha inválida proporcionada: ${fecha}`);
  }
  
  // Usamos formateador Intl con la zona horaria configurada
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_CONFIG.TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(d);
}

/**
 * Extrae el mes y año en formato YYYY-MM según la zona horaria configurada.
 * @param {Date|string|number} [fecha=new Date()]
 * @returns {string} Cadena en formato YYYY-MM
 */
export function obtenerMesString(fecha = new Date()) {
  const fechaStr = obtenerFechaString(fecha);
  return fechaStr.substring(0, 7);
}

/**
 * Determina si dos fechas corresponden al mismo día civil según el criterio definido.
 * @param {Date|string|number} fechaA
 * @param {Date|string|number} fechaB
 * @returns {boolean}
 */
export function sonMismoDia(fechaA, fechaB) {
  return obtenerFechaString(fechaA) === obtenerFechaString(fechaB);
}

/**
 * Comprueba si una fecha está dentro del rango especificado (ambos extremos inclusivos).
 * @param {Date|string|number} fecha - Fecha a evaluar
 * @param {Date|string|number} fechaInicio - Inicio del rango
 * @param {Date|string|number} fechaFin - Fin del rango
 * @returns {boolean}
 */
export function estaEnRango(fecha, fechaInicio, fechaFin) {
  const diaFecha = obtenerFechaString(fecha);
  const diaInicio = obtenerFechaString(fechaInicio);
  const diaFin = obtenerFechaString(fechaFin);

  return diaFecha >= diaInicio && diaFecha <= diaFin;
}

/**
 * Convierte cualquier fecha válida en ISO String estándar.
 * @param {Date|string|number} [fecha=new Date()]
 * @returns {string}
 */
export function aIsoString(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (isNaN(d.getTime())) {
    throw new TypeError(`Fecha inválida: ${fecha}`);
  }
  return d.toISOString();
}
