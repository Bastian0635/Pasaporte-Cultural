/**
 * Validadores puros de negocio e integridad de datos.
 */

import { ROLES_VALIDOS, CATEGORIAS_VALIDAS } from './constants.js';
import { ValidationError } from './errors.js';
import { obtenerFechaString } from './dateUtils.js';

/**
 * Valida que un campo de texto no esté vacío y cumpla límites de longitud.
 * @param {string} valor
 * @param {string} nombreCampo
 * @param {object} [opciones={}]
 * @returns {string} Texto limpio (trim)
 */
export function validarTexto(valor, nombreCampo, { min = 1, max = 500, requerido = true } = {}) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    if (requerido) {
      throw new ValidationError(`El campo '${nombreCampo}' es obligatorio.`, { campo: nombreCampo });
    }
    return '';
  }

  const limpio = String(valor).trim();
  if (limpio.length < min) {
    throw new ValidationError(`El campo '${nombreCampo}' debe tener al menos ${min} caracter(es).`, {
      campo: nombreCampo,
      min,
      longitudActual: limpio.length
    });
  }

  if (limpio.length > max) {
    throw new ValidationError(`El campo '${nombreCampo}' no puede exceder ${max} caracteres.`, {
      campo: nombreCampo,
      max,
      longitudActual: limpio.length
    });
  }

  return limpio;
}

/**
 * Valida formato de correo electrónico.
 * @param {string} email
 * @returns {string} Email en minúsculas
 */
export function validarEmail(email) {
  const emailLimpio = validarTexto(email, 'email', { min: 5, max: 120, requerido: true }).toLowerCase();
  const patron = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!patron.test(emailLimpio)) {
    throw new ValidationError(`El correo electrónico '${email}' no tiene un formato válido.`, {
      campo: 'email',
      valor: email
    });
  }
  return emailLimpio;
}

/**
 * Valida que el rol sea uno de los permitidos ('visitante' o 'editor').
 * @param {string} rol
 * @returns {string}
 */
export function validarRol(rol) {
  const rolLimpio = validarTexto(rol, 'rol', { min: 3, max: 20, requerido: true }).toLowerCase();
  if (!ROLES_VALIDOS.includes(rolLimpio)) {
    throw new ValidationError(
      `El rol '${rol}' no es válido. Debe ser uno de: ${ROLES_VALIDOS.join(', ')}.`,
      { campo: 'rol', permitidos: ROLES_VALIDOS, valor: rol }
    );
  }
  return rolLimpio;
}

/**
 * Valida categoría de lugar ('museo', 'galería', 'centro cultural').
 * @param {string} categoria
 * @returns {string}
 */
export function validarCategoria(categoria) {
  const catLimpia = validarTexto(categoria, 'categoría', { min: 3, max: 50, requerido: true }).toLowerCase();
  if (!CATEGORIAS_VALIDAS.includes(catLimpia)) {
    throw new ValidationError(
      `La categoría '${categoria}' no es válida. Debe ser una de: ${CATEGORIAS_VALIDAS.join(', ')}.`,
      { campo: 'categoria', permitidos: CATEGORIAS_VALIDAS, valor: categoria }
    );
  }
  return catLimpia;
}

/**
 * Valida que el código de registro sea una cadena alfanumérica consistente.
 * @param {string} codigo
 * @returns {string} Código en mayúsculas
 */
export function validarCodigoRegistro(codigo) {
  const codigoLimpio = validarTexto(codigo, 'código de registro', { min: 3, max: 30, requerido: true }).toUpperCase();
  if (!/^[A-Z0-9\-_]+$/.test(codigoLimpio)) {
    throw new ValidationError(
      `El código de registro solo puede contener letras mayúsculas, números, guiones y guiones bajos.`,
      { campo: 'codigoRegistro', valor: codigo }
    );
  }
  return codigoLimpio;
}

/**
 * Valida que la meta de un reto sea un número entero mayor que cero (Regla 5).
 * @param {number|string} meta
 * @returns {number}
 */
export function validarMetaReto(meta) {
  const num = Number(meta);
  if (!Number.isInteger(num) || num <= 0) {
    throw new ValidationError(
      `La meta del reto debe ser un número entero mayor que cero. Valor recibido: ${meta}`,
      { campo: 'meta', valor: meta }
    );
  }
  return num;
}

/**
 * Valida que la fecha inicial no sea posterior a la fecha final (Regla 5).
 * @param {Date|string} fechaInicio
 * @param {Date|string} fechaFin
 */
export function validarRangoFechasReto(fechaInicio, fechaFin) {
  const strInicio = obtenerFechaString(fechaInicio);
  const strFin = obtenerFechaString(fechaFin);

  if (strInicio > strFin) {
    throw new ValidationError(
      `La fecha inicial (${strInicio}) no puede ser posterior a la fecha final (${strFin}).`,
      { campo: 'fechas', fechaInicio: strInicio, fechaFin: strFin }
    );
  }

  return { fechaInicio: strInicio, fechaFin: strFin };
}

/**
 * Valida identificador no vacío.
 * @param {string|number} id
 * @param {string} [nombreCampo='id']
 * @returns {string}
 */
export function validarIdentificador(id, nombreCampo = 'id') {
  if (id === undefined || id === null || String(id).trim() === '') {
    throw new ValidationError(`El identificador para '${nombreCampo}' es requerido.`, { campo: nombreCampo });
  }
  return String(id).trim();
}
