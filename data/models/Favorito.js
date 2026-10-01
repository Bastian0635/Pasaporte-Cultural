/**
 * Modelo de datos: Favorito
 * Representa la relación usuario - lugar favorito guardado.
 */

import { aIsoString } from '../../core/dateUtils.js';
import { validarIdentificador } from '../../core/validators.js';

export class Favorito {
  /**
   * @param {object} params
   * @param {string|number} [params.id]
   * @param {string|number} params.usuarioId
   * @param {string|number} params.lugarId
   * @param {string|Date} [params.createdAt]
   * @param {object} [params.lugar] - Detalle del lugar (opcional al listar favoritos)
   */
  constructor({
    id,
    usuarioId,
    lugarId,
    createdAt = new Date(),
    lugar = null
  }) {
    this.id = id ? String(id) : undefined;
    this.usuarioId = validarIdentificador(usuarioId, 'usuarioId');
    this.lugarId = validarIdentificador(lugarId, 'lugarId');
    this.createdAt = aIsoString(createdAt);
    this.lugar = lugar;
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      lugarId: this.lugarId,
      createdAt: this.createdAt,
      lugar: this.lugar
    };
  }

  static fromDatabase(row) {
    if (!row) return null;
    return new Favorito({
      id: row.id,
      usuarioId: row.usuario_id || row.usuarioId,
      lugarId: row.lugar_id || row.lugarId,
      createdAt: row.created_at || row.createdAt,
      lugar: row.lugar_nombre ? {
        id: String(row.lugar_id),
        nombre: row.lugar_nombre,
        categoria: row.lugar_categoria,
        municipio: row.lugar_municipio,
        imagen: row.lugar_imagen,
        activo: row.lugar_activo === 1 || row.lugar_activo === true
      } : null
    });
  }
}
