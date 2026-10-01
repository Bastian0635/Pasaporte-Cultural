/**
 * data/repositories/RetoRepository.js
 * 
 * Acceso y persistencia para la entidad Reto.
 */

import { randomUUID } from 'node:crypto';
import { Reto } from '../models/Reto.js';
import { getDatabaseProvider } from '../providers/sqliteProvider.js';

export class RetoRepository {
  /**
   * @param {import('../providers/sqliteProvider.js').SqliteProvider} [provider]
   */
  constructor(provider = null) {
    this.provider = provider || getDatabaseProvider();
  }

  /**
   * Obtiene un reto por su ID.
   * @param {string} id
   * @returns {Reto|null}
   */
  obtenerPorId(id) {
    if (!id) return null;
    const row = this.provider.get('SELECT * FROM retos WHERE id = ?', [String(id)]);
    return row ? Reto.fromDatabase(row) : null;
  }

  /**
   * Lista todos los retos.
   * @returns {Reto[]}
   */
  listarTodos() {
    const rows = this.provider.all('SELECT * FROM retos ORDER BY fecha_inicio DESC, titulo ASC');
    return rows.map((r) => Reto.fromDatabase(r));
  }

  /**
   * Lista solo los retos activos.
   * @returns {Reto[]}
   */
  listarActivos() {
    const rows = this.provider.all(
      'SELECT * FROM retos WHERE activo = 1 ORDER BY fecha_inicio DESC, titulo ASC'
    );
    return rows.map((r) => Reto.fromDatabase(r));
  }

  /**
   * Guarda o actualiza un reto.
   * @param {Reto} reto
   * @returns {Reto}
   */
  guardar(reto) {
    const id = reto.id || randomUUID();
    const createdAt = reto.createdAt || new Date().toISOString();
    const activoInt = reto.activo ? 1 : 0;

    this.provider.run(
      `INSERT INTO retos (id, titulo, descripcion, categoria, meta, fecha_inicio, fecha_fin, activo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         titulo = excluded.titulo,
         descripcion = excluded.descripcion,
         categoria = excluded.categoria,
         meta = excluded.meta,
         fecha_inicio = excluded.fecha_inicio,
         fecha_fin = excluded.fecha_fin,
         activo = excluded.activo`,
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

    return this.obtenerPorId(id);
  }

  /**
   * Cuenta total de retos registrados.
   * @returns {number}
   */
  contar() {
    const row = this.provider.get('SELECT COUNT(*) as total FROM retos');
    return row ? row.total : 0;
  }
}
