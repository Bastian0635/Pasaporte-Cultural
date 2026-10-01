/**
 * data/repositories/FavoritoRepository.js
 * 
 * Acceso y persistencia para la entidad Favorito.
 */

import { randomUUID } from 'node:crypto';
import { Favorito } from '../models/Favorito.js';
import { getDatabaseProvider } from '../providers/sqliteProvider.js';

export class FavoritoRepository {
  /**
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Verifica si existe la relación favorito entre usuario y lugar.
   * @param {string} usuarioId
   * @param {string} lugarId
   * @returns {boolean}
   */
  existe(usuarioId, lugarId) {
    const row = this.provider.get(
      'SELECT id FROM favoritos WHERE usuario_id = ? AND lugar_id = ?',
      [String(usuarioId), String(lugarId)]
    );
    return Boolean(row);
  }

  /**
   * Establece el estado de favorito (sí/no) para un usuario y un lugar.
   * Regla 4: Marcar dos veces el mismo lugar no crea duplicados; quitarlo elimina la relación.
   * @param {string} usuarioId
   * @param {string} lugarId
   * @param {boolean} siNo - true para agregar/mantener, false para quitar
   * @returns {boolean} Estado final (true = es favorito, false = no es favorito)
   */
  establecer(usuarioId, lugarId, siNo) {
    const uId = String(usuarioId);
    const lId = String(lugarId);

    if (siNo) {
      // Usar INSERT OR IGNORE para no crear duplicados
      this.provider.run(
        `INSERT OR IGNORE INTO favoritos (id, usuario_id, lugar_id, created_at)
         VALUES (?, ?, ?, ?)`,
        [randomUUID(), uId, lId, new Date().toISOString()]
      );
      return true;
    } else {
      this.provider.run(
        'DELETE FROM favoritos WHERE usuario_id = ? AND lugar_id = ?',
        [uId, lId]
      );
      return false;
    }
  }

  /**
   * Lista los lugares marcados como favoritos por un usuario.
   * Devuelve los favoritos con la información completa del lugar.
   * @param {string} usuarioId
   * @returns {Favorito[]}
   */
  listarPorUsuario(usuarioId) {
    const rows = this.provider.all(
      `SELECT f.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria,
              l.municipio as lugar_municipio, l.imagen as lugar_imagen, l.activo as lugar_activo
       FROM favoritos f
       JOIN lugares l ON f.lugar_id = l.id
       WHERE f.usuario_id = ?
       ORDER BY f.created_at DESC`,
      [String(usuarioId)]
    );
    return rows.map((r) => Favorito.fromDatabase(r));
  }

  /**
   * Cuenta cantidad de favoritos de un usuario.
   * @param {string} usuarioId
   * @returns {number}
   */
  contarPorUsuario(usuarioId) {
    const row = this.provider.get(
      'SELECT COUNT(*) as total FROM favoritos WHERE usuario_id = ?',
      [String(usuarioId)]
    );
    return row ? row.total : 0;
  }
}
