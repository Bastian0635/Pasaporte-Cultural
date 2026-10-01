/**
 * Modelo de datos: Visita
 * Registra la asistencia verificada de un usuario a un lugar en una fecha y hora.
 */

import { aIsoString, obtenerFechaString } from '../../core/dateUtils.js';
import { validarIdentificador } from '../../core/validators.js';

export class Visita {
  /**
   * @param {object} params
   * @param {string|number} [params.id]
   * @param {string|number} params.usuarioId
   * @param {string|number} params.lugarId
   * @param {string|Date} [params.fechaHora]
   * @param {object} [params.lugar] - Datos opcionales del lugar (para consultas enriquecidas)
   */
  constructor({
    id,
    usuarioId,
    lugarId,
    fechaHora = new Date(),
    lugar = null
  }) {
    this.id = id ? String(id) : undefined;
    this.usuarioId = validarIdentificador(usuarioId, 'usuarioId');
    this.lugarId = validarIdentificador(lugarId, 'lugarId');
    this.fechaHora = aIsoString(fechaHora);
    this.lugar = lugar;
  }

  /**
   * Obtiene el día civil (YYYY-MM-DD) en la zona horaria del sistema.
   * Clave para verificar unicidad por día (Regla 3).
   */
  obtenerDia() {
    return obtenerFechaString(this.fechaHora);
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      lugarId: this.lugarId,
      fechaHora: this.fechaHora,
      dia: this.obtenerDia(),
      lugar: this.lugar
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Visita({
      id: row.id,
      usuarioId: row.usuario_id || row.usuarioId,
      lugarId: row.lugar_id || row.lugarId,
      fechaHora: row.fecha_hora || row.fechaHora,
      lugar: row.lugar_nombre ? {
        id: String(row.lugar_id),
        nombre: row.lugar_nombre,
        categoria: row.lugar_categoria,
        municipio: row.lugar_municipio,
        imagen: row.lugar_imagen
      } : null
    });
  }
}
