/**
 * data/repositories/FavoritoRepository.js
 * 
 * Acceso y persistencia para la entidad Favorito con PostgreSQL.
 */

import { randomUUID } from 'node:crypto';
import { Favorito } from '../models/Favorito.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class FavoritoRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Verifica si existe la relación favorito entre usuario y lugar.
   * @param {string} usuarioId
   * @param {string} lugarId
   * @returns {Promise<boolean>}
   */
  async existe(usuarioId, lugarId) {
    const row = await this.provider.get(
      'SELECT id FROM favoritos WHERE usuario_id = $1 AND lugar_id = $2',
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
   * @returns {Promise<boolean>} Estado final (true = es favorito, false = no es favorito)
   */
  async establecer(usuarioId, lugarId, siNo) {
    const uId = String(usuarioId);
    const lId = String(lugarId);

    if (siNo) {
      // Usar ON CONFLICT DO NOTHING en PostgreSQL para evitar duplicados
      await this.provider.run(
        `INSERT INTO favoritos (id, usuario_id, lugar_id, created_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (usuario_id, lugar_id) DO NOTHING`,
        [randomUUID(), uId, lId, new Date().toISOString()]
      );
      return true;
    } else {
      await this.provider.run(
        'DELETE FROM favoritos WHERE usuario_id = $1 AND lugar_id = $2',
        [uId, lId]
      );
      return false;
    }
  }

  /**
   * Lista los lugares marcados como favoritos por un usuario.
   * Devuelve los favoritos con la información completa del lugar.
   * @param {string} usuarioId
   * @returns {Promise<Favorito[]>}
   */
  async listarPorUsuario(usuarioId) {
    const rows = await this.provider.all(
      `SELECT f.*, l.nombre as lugar_nombre, l.categoria as lugar_categoria,
              l.municipio as lugar_municipio, l.imagen as lugar_imagen, l.activo as lugar_activo
       FROM favoritos f
       JOIN lugares l ON f.lugar_id = l.id
       WHERE f.usuario_id = $1
       ORDER BY f.created_at DESC`,
      [String(usuarioId)]
    );
    return rows.map((r) => Favorito.fromDatabase(r));
  }

  /**
   * Cuenta cantidad de favoritos de un usuario.
   * @param {string} usuarioId
   * @returns {Promise<number>}
   */
  async contarPorUsuario(usuarioId) {
    const row = await this.provider.get(
      'SELECT COUNT(*) as total FROM favoritos WHERE usuario_id = $1',
      [String(usuarioId)]
    );
    return row ? parseInt(row.total, 10) : 0;
  }
}
