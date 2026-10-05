/**
 * data/repositories/RetoRepository.js
 * 
 * Acceso y persistencia para la entidad Reto con PostgreSQL.
 */

import { randomUUID } from 'node:crypto';
import { Reto } from '../models/Reto.js';
import { getDatabaseProvider } from '../providers/postgresProvider.js';

export class RetoRepository {
  /**
   * @param {import('../providers/postgresProvider.js').PostgresProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Obtiene un reto por su ID.
   * @param {string} id
   * @returns {Promise<Reto|null>}
   */
  async obtenerPorId(id) {
    if (!id) return null;
    const row = await this.provider.get('SELECT * FROM retos WHERE id = $1', [String(id)]);
    return row ? Reto.fromDatabase(row) : null;
  }

  /**
   * Lista todos los retos.
   * @returns {Promise<Reto[]>}
   */
  async listarTodos() {
    const rows = await this.provider.all('SELECT * FROM retos ORDER BY fecha_inicio DESC, titulo ASC');
    return rows.map((r) => Reto.fromDatabase(r));
  }

  /**
   * Lista solo los retos activos.
   * @returns {Promise<Reto[]>}
   */
  async listarActivos() {
    const rows = await this.provider.all(
      'SELECT * FROM retos WHERE activo = 1 ORDER BY fecha_inicio DESC, titulo ASC'
    );
    return rows.map((r) => Reto.fromDatabase(r));
  }

  /**
   * Guarda o actualiza un reto.
   * @param {Reto} reto
   * @returns {Promise<Reto>}
   */
  async guardar(reto) {
    const id = reto.id || randomUUID();
    const createdAt = reto.createdAt || new Date().toISOString();
    const activoInt = reto.activo ? 1 : 0;

    const row = await this.provider.get(
      `INSERT INTO retos (id, titulo, descripcion, categoria, meta, fecha_inicio, fecha_fin, activo, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         titulo = EXCLUDED.titulo,
         descripcion = EXCLUDED.descripcion,
         categoria = EXCLUDED.categoria,
         meta = EXCLUDED.meta,
         fecha_inicio = EXCLUDED.fecha_inicio,
         fecha_fin = EXCLUDED.fecha_fin,
         activo = EXCLUDED.activo
       RETURNING *`,
      [
        id,
        reto.titulo,
        reto.descripcion,
        reto.categoria,
        reto.meta,
        reto.fechaInicio,
        reto.fechaFin,
        activoInt,
        createdAt
      ]
    );

    return row ? Reto.fromDatabase(row) : await this.obtenerPorId(id);
  }

  /**
   * Cuenta total de retos registrados.
   * @returns {Promise<number>}
   */
  async contar() {
    const row = await this.provider.get('SELECT COUNT(*) as total FROM retos');
    return row ? parseInt(row.total, 10) : 0;
  }
}
